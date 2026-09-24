"""Correlation: group findings into ASSETS (same SPKI fingerprint = one asset, plus attached config/code refs)."""
import json
import re
from pathlib import Path, PurePosixPath

HYBRID = "X25519MLKEM768"
_PATH_REF = re.compile(r"[\w./\-]+\.(?:key|crt|pem|cer|p12|pfx|jks)\b", re.I)


def _meta(f: dict) -> dict:
    m = f.get("meta")
    if isinstance(m, str):
        try:
            return json.loads(m) if m else {}
        except ValueError:
            return {}
    return m or {}


def _norm(p: str) -> str:
    return PurePosixPath(p.replace("\\", "/")).as_posix().lstrip("./")


def _matches(ref: str, loc: str) -> bool:
    ref, loc = _norm(ref), _norm(loc)
    return loc == ref or loc.endswith("/" + ref) or ref.endswith("/" + loc)


def _key(f: dict) -> str:
    return f["fingerprint"] or f"{f['plane']}:{f['file']}:{f['line']}:{f['algorithm']}"


def correlate(findings: list[dict], root: str | Path | None = None) -> list[dict]:
    """Return assets: {key, fingerprint, finding_ids, findings, hybrid, ...}. `root` enables code-file reference lookup."""
    groups: dict[str, list[dict]] = {}
    loose = []
    for f in findings:
        (groups.setdefault(f["fingerprint"], []) if f["fingerprint"] else loose).append(f)
    # reference index: path -> fingerprint (physical key/cert files only, not container/tls copies)
    ref_fp: dict[str, str] = {}
    for fp, fs in groups.items():
        for f in fs:
            if f["plane"] == "certificates" and "!" not in f["file"]:
                ref_fp[f["file"]] = fp

    def find_fp(ref: str):
        return next((fp for path, fp in ref_fp.items() if _matches(ref, path)), None)

    attached = []
    for f in loose:
        m, target = _meta(f), None
        for ref in (m.get("key_refs") or []) + (m.get("cert_refs") or []):
            target = find_fp(ref)
            if target:
                break
        if not target and f["plane"] == "code" and root and "!" not in f["file"]:
            try:
                text = (Path(root) / f["file"]).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                text = ""
            for ref in _PATH_REF.findall(text):
                target = find_fp(ref)
                if target:
                    break
        if target:
            groups[target].append(f)
        else:
            attached.append(f)
    assets = [_asset(fp, fs) for fp, fs in groups.items()]
    assets += [_asset(_key(f), [f]) for f in attached]
    return assets


def _asset(key: str, fs: list[dict]) -> dict:
    fps = [f for f in fs if f["fingerprint"]]
    primary = next((f for f in fps if _meta(f).get("kind") == "private_key"), None) or (fps or fs)[0]
    size = f"-{primary['key_size']}" if primary["key_size"] else ""
    name = PurePosixPath(primary["file"].split("!")[-1]).name if fps else f"{primary['file']}:{primary['line']}"
    # Hybrid counts only where the declared config can negotiate it (TLS 1.3 enabled). A group line the rest
    # of the config makes unreachable is recorded as ineffective with its reason, never credited.
    configured = [f for f in fs if f["algorithm"] == HYBRID and f["plane"] in ("configs", "tls")]
    hybrid = [f["id"] for f in configured if (_meta(f).get("tls") or {}).get("hybrid_effective")]
    ineffective = sorted({(_meta(f).get("tls") or {}).get("hybrid_why") or "not negotiable"
                          for f in configured if f["id"] not in hybrid})
    n = len(fs)
    return {"key": key, "fingerprint": primary["fingerprint"], "label": f"{primary['algorithm']}{size} {name}",
            "algorithm": primary["algorithm"], "key_size": primary["key_size"], "findings": fs,
            "finding_ids": [f["id"] for f in fs], "hybrid_finding_ids": hybrid, "hybrid": bool(hybrid),
            "hybrid_ineffective": ineffective,
            "summary": f"{n} finding{'s' if n != 1 else ''} → 1 asset",
            "locations": [{"finding_id": f["id"], "plane": f["plane"], "file": f["file"], "line": f["line"]}
                          for f in fs]}
