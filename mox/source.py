"""Resolve any Scan-page source kind (docs/MOX_V2_BUILD_PLAN.md Phase 2, D1) into a real directory the
existing scanner can walk, plus a cleanup to run once the scan is done.

Archive, container image and artefact uploads all reduce to the same shape: place real files in a fresh
per-scan temp directory, then run the ordinary local-folder pipeline over it. Git adds one extra fact
(the commit SHA); live-TLS-only scans just have nothing to walk.
"""
import shutil
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from . import extract, gitsource

ARCHIVE_KINDS = ("archive", "container", "artefacts")


class SourceError(Exception):
    """A clear, user-facing reason a source could not be prepared. Never a bare stack trace."""


def validate_local_path(raw: str) -> Path:
    """Local folder only: no URLs, no UNC/network shares, must exist and be a directory. The same rule
    mox/jobs.py's validate_path enforces for the plain "folder" source; kept here too so git's local-clone
    case can reuse it without an import cycle (jobs.py orchestrates via this module, not the reverse)."""
    s = (raw or "").strip().strip('"')
    if not s:
        raise SourceError("enter a folder path")
    if "://" in s or s.startswith(("\\\\", "//")):
        raise SourceError("only local folders can be scanned (no URLs or network shares)")
    p = Path(s).expanduser()
    if not p.is_absolute():
        raise SourceError(r"enter an absolute folder path, e.g. D:\code\my-repo")
    if not p.exists():
        raise SourceError(f"path does not exist: {s}")
    if not p.is_dir():
        raise SourceError(f"not a directory: {s}")
    return p.resolve()


@dataclass
class Resolved:
    path: Path
    cleanup: callable = field(default=lambda: None)
    meta: dict = field(default_factory=dict)


def _temp_dir() -> Path:
    return Path(tempfile.mkdtemp(prefix="mox-scan-"))


def _cleanup(path: Path) -> callable:
    return lambda: shutil.rmtree(path, ignore_errors=True)


def from_upload(kind: str, files: list[tuple[str, bytes]]) -> Resolved:
    """kind: "archive" (one file, extracted safely), "container" (one docker-save .tar, left for the
    containers plane to walk), or "artefacts" (any number of binaries/certs/configs, placed as-is)."""
    if kind not in ARCHIVE_KINDS:
        raise SourceError(f"unknown upload source: {kind}")
    if not files:
        raise SourceError("no file was uploaded")
    dest = _temp_dir()
    try:
        if kind == "archive":
            if len(files) != 1:
                raise SourceError("upload exactly one archive")
            name, data = files[0]
            if not name.lower().endswith(extract.ARCHIVE_SUFFIXES):
                raise SourceError(f"unsupported archive type: {name}")
            tmp_archive = dest / f"_upload_{name}"
            tmp_archive.write_bytes(data)
            try:
                extract.extract(tmp_archive, dest)
            finally:
                tmp_archive.unlink(missing_ok=True)
        elif kind == "container":
            if len(files) != 1:
                raise SourceError("upload exactly one container image (docker save .tar)")
            name, data = files[0]
            if not name.lower().endswith(".tar"):
                raise SourceError(f"a container image must be a docker save .tar, not: {name}")
            (dest / name).write_bytes(data)
        else:  # artefacts: any number of files, placed by their own name
            for name, data in files:
                target = dest / Path(name).name  # never trust a path separator from the client
                target.write_bytes(data)
    except extract.UnsafeArchive:
        shutil.rmtree(dest, ignore_errors=True)
        raise
    except Exception:
        shutil.rmtree(dest, ignore_errors=True)
        raise
    names = ", ".join(n for n, _ in files)
    return Resolved(dest, _cleanup(dest), {"source_kind": kind, "source_ref": names})


def from_git(path: str | None, remote_url: str | None, authorized: bool) -> Resolved:
    """`path`: a local clone (scanned in place, no cleanup). `remote_url`: cloned into a fresh temp dir
    (opt-in, counted — see mox.gitsource.clone_remote)."""
    if remote_url:
        dest = _temp_dir()
        try:
            sha = gitsource.clone_remote(remote_url, dest, authorized)
        except gitsource.GitError:
            shutil.rmtree(dest, ignore_errors=True)
            raise
        return Resolved(dest, _cleanup(dest), {"source_kind": "git", "source_ref": remote_url, "commit": sha})
    local = validate_local_path(path or "")
    return Resolved(local, lambda: None, {"source_kind": "git", "source_ref": str(local),
                                          "commit": gitsource.commit_sha(local)})


def from_folder(path: str) -> Resolved:
    local = validate_local_path(path)
    return Resolved(local, lambda: None, {"source_kind": "folder", "source_ref": str(local)})


def tls_only() -> Resolved:
    """Live TLS endpoints, no filesystem target: an empty directory so the file planes trivially find
    nothing real (never faked) while the TLS plane still probes."""
    dest = _temp_dir()
    return Resolved(dest, _cleanup(dest), {"source_kind": "tls", "source_ref": None})
