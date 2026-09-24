"""preview diff -> approve -> .bak backup -> apply -> re-scan that one file. Every step is audited."""
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from .. import auth, scanner
from . import claims, fix_text, unified_diff


class FixError(Exception):
    def __init__(self, msg, status=400):
        super().__init__(msg)
        self.status = status


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def _target(conn, finding_id):
    f = conn.execute("SELECT * FROM findings WHERE id=?", (finding_id,)).fetchone()
    if not f:
        raise FixError("finding not found", 404)
    f = dict(f)
    root = Path(conn.execute("SELECT target FROM scans WHERE id=?", (f["scan_id"],)).fetchone()["target"]).resolve()
    path = (root / f["file"]).resolve()
    if root not in path.parents or not path.is_file():
        raise FixError("file is not inside the scanned target or no longer exists", 404)
    return f, root, path


def _view(row) -> dict:
    d = json.loads(row["data"])
    return {"id": row["id"], "finding_id": row["finding_id"], "file": row["file"], "status": row["status"],
            "diff": row["diff"], "backup": row["backup"], "created_at": row["created_at"], **d}


def get(conn, fix_id) -> dict:
    row = conn.execute("SELECT * FROM fixes WHERE id=?", (fix_id,)).fetchone()
    if not row:
        raise FixError("fix not found", 404)
    return _view(row)


def _trail(d, text):
    d.setdefault("trail", []).append({"ts": _now(), "text": text})


def preview(conn, finding_id: int, actor: str) -> dict:
    f, root, path = _target(conn, finding_id)
    old = path.read_bytes().decode("utf-8")
    new = fix_text(f, old)
    if new is None:
        raise FixError(f"no automatic fix for {f['algorithm']} at {f['file']}:{f['line']}", 422)
    diff = unified_diff(old, new, f["file"])
    changed = sum(1 for l in diff.splitlines() if l[:1] in "+-" and l[:3] not in ("+++", "---"))
    data = {"scan_id": f["scan_id"], "algorithm": f["algorithm"], "line": f["line"], "key_size": f["key_size"], "src_sha": _sha(old.encode()),
            "lines_changed": changed, "old": old, "new": new,
            "claims": claims(f, new)}  # what the patched file would do, shown before approval
    _trail(data, f"finding F-{f['id']:04d} opened · {f['algorithm']}{f' {f['key_size']}' if f['key_size'] else ''}")
    _trail(data, f"patch generated · {changed} changed lines")
    cur = conn.execute("INSERT INTO fixes(finding_id,file,status,diff,backup,created_at,data) VALUES(?,?,?,?,?,?,?)",
                       (finding_id, f["file"], "previewed", diff, None, _now(), json.dumps(data)))
    conn.commit()
    auth.audit(conn, actor, "fix-preview", f"F-{finding_id} {f['file']}:{f['line']} {f['algorithm']}")
    return get(conn, cur.lastrowid)


def apply(conn, fix_id: int, actor: str, note: str = "") -> dict:
    row = conn.execute("SELECT * FROM fixes WHERE id=?", (fix_id,)).fetchone()
    if not row:
        raise FixError("fix not found", 404)
    if row["status"] != "previewed":
        raise FixError(f"fix already {row['status']}", 409)
    d = json.loads(row["data"])
    f, root, path = _target(conn, row["finding_id"])
    raw = path.read_bytes()
    if _sha(raw) != d["src_sha"]:
        raise FixError("file changed since the preview; preview again", 409)
    note = note.strip()[:200]
    auth.audit(conn, actor, "fix-approve", f"fix {fix_id} {f['file']}" + (f" note: {note}" if note else ""))
    _trail(d, f"approved by {actor}" + (f" · {note}" if note else ""))
    d.update(approved_by=actor, approved_at=_now(), review_note=note or None)  # "who signed it" (docs/SCREENS.md)
    bak = path.with_name(path.name + ".bak")
    if not bak.exists():  # keep the earliest copy: it is the true original
        shutil.copy2(path, bak)
    new_bytes = d["new"].encode("utf-8")
    path.write_bytes(new_bytes)
    auth.audit(conn, actor, "fix-apply", f"fix {fix_id} {f['file']} backup {bak.name} sha256 {_sha(bak.read_bytes())[:12]}")
    _trail(d, f"backup written · {bak.name} · sha256 {_sha(bak.read_bytes())[:12]}…")
    ctx = scanner.Ctx()
    fresh = scanner._dedupe(ctx.scan_file(path, f["file"]))
    sig = (f["algorithm"], f["key_size"], f["mode"], f["curve"])
    before = _count_same(conn, f)
    same = [x for x in fresh if (x.algorithm, x.key_size, x.mode, x.curve) == sig]
    cleared = len(same) < before
    conn.execute("DELETE FROM findings WHERE scan_id=? AND file=?", (f["scan_id"], f["file"]))
    scanner.store_findings(conn, f["scan_id"], fresh)
    total = conn.execute("SELECT COUNT(*) FROM findings WHERE scan_id=?", (f["scan_id"],)).fetchone()[0]
    conn.execute("UPDATE scans SET findings_count=? WHERE id=?", (total, f["scan_id"]))
    # Re-derive every claim from the file as it now is on disk, not from what the patch intended.
    d["claims"] = claims(f, path.read_bytes().decode("utf-8"))
    broken = [c for c in d["claims"] if c["state"] == "not-in-effect" and not c.get("limit")]
    d["cleared"] = cleared
    d["remaining"] = len(same)
    d.pop("old", None)
    d.pop("new", None)
    status = "still-present" if not cleared else "not-in-effect" if broken else "cleared"
    result = {"cleared": "cleared", "still-present": "still present",
              "not-in-effect": "cleared, but part of the change cannot take effect"}[status]
    _trail(d, f"re-scan complete · {len(fresh)} findings in file · finding {result}")
    for c in d["claims"]:
        _trail(d, f"{c['claim']}: {c['state'].replace('-', ' ')} · {c['detail']}")
    conn.execute("UPDATE fixes SET status=?, backup=?, data=? WHERE id=?",
                 (status, str(bak.name), json.dumps(d), fix_id))
    conn.commit()
    auth.audit(conn, actor, "fix-rescan", f"fix {fix_id} {f['file']} -> {status}")
    return get(conn, fix_id)


def _count_same(conn, f) -> int:
    """How many identical findings the file had before the fix (from the DB, pre-rescan)."""
    return conn.execute("SELECT COUNT(*) FROM findings WHERE scan_id=? AND file=? AND algorithm=? AND"
                        " key_size IS ? AND mode IS ? AND curve IS ?",
                        (f["scan_id"], f["file"], f["algorithm"], f["key_size"], f["mode"], f["curve"])).fetchone()[0]


def fixable(conn, finding_ids) -> set[int]:
    """The subset of finding_ids for which a fixer produces a patch for the file as it is now."""
    out = set()
    for fid in finding_ids:
        try:
            f, _, path = _target(conn, fid)
            if "!" not in f["file"] and fix_text(f, path.read_text(encoding="utf-8")) is not None:
                out.add(fid)
        except (FixError, UnicodeDecodeError, OSError):
            continue
    return out


def candidates(conn) -> list[dict]:
    """Findings of the latest scan that have an automatic fix, each with its fix history status."""
    scan = conn.execute("SELECT id FROM scans ORDER BY id DESC LIMIT 1").fetchone()
    out = []
    for r in conn.execute("SELECT * FROM findings WHERE scan_id=? AND plane IN ('code','configs') ORDER BY file,line",
                          (scan["id"] if scan else 0,)):
        f = dict(r)
        try:
            _, _, path = _target(conn, f["id"])
            if fix_text(f, path.read_text(encoding="utf-8")) is None:
                continue
        except (FixError, UnicodeDecodeError):
            continue
        out.append({k: f[k] for k in ("id", "algorithm", "key_size", "file", "line", "evidence", "nist_now")})
    return out
