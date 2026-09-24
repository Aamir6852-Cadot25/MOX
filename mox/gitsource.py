"""Git repository source (docs/MOX_V2_BUILD_PLAN.md Phase 2, D1 "Git repository"). A local clone path
scans like a local folder, plus records the checked-out commit SHA. A remote URL clone is opt-in and is
one of the only outbound network paths in the product (with the D7 git push and the live TLS probe); it
goes through netguard and is counted (AGENTS.md "Air-gap").
"""
import subprocess
from pathlib import Path


class GitError(Exception):
    """A clear, user-facing reason a git operation was refused or failed."""


def commit_sha(path: Path) -> str | None:
    """The checked-out commit of a local clone, or None if `path` is not inside a git working tree."""
    try:
        out = subprocess.run(["git", "-C", str(path), "rev-parse", "HEAD"], capture_output=True,
                              text=True, timeout=10)
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.strip() if out.returncode == 0 else None


def clone_remote(url: str, dest: Path, authorized: bool) -> str | None:
    """Clone `url` into `dest` (must not already exist). Opt-in only: `authorized` must be explicitly
    True. Counted via netguard.record_external before the attempt, so a refused or failed clone still
    shows as an outbound call (the pill counts calls made, not calls that succeeded). Returns the cloned
    commit SHA."""
    from . import netguard

    if not authorized:
        raise GitError("cloning a remote repository is an outbound network call; it needs explicit authorisation")
    if "://" not in url and not url.startswith("git@"):
        raise GitError(f"not a git remote URL: {url}")
    netguard.record_external(url)
    try:
        out = subprocess.run(["git", "clone", "--depth", "1", url, str(dest)],
                             capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired as e:
        raise GitError(f"git clone timed out: {e}") from e
    except OSError as e:
        raise GitError(f"could not run git: {e}") from e
    if out.returncode != 0:
        raise GitError(f"git clone failed: {out.stderr.strip()[:300]}")
    return commit_sha(dest)
