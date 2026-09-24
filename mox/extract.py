"""Safe extraction for uploaded archives and container images (docs/MOX_V2_BUILD_PLAN.md Phase 2).

Defends against zip-slip / path traversal, symlinks that escape the destination, and decompression
bombs (uncompressed-size cap, compression-ratio cap, file-count cap). A malicious or oversized archive
raises UnsafeArchive with a clear reason; it never lets a stack trace reach the caller.
"""
import tarfile
import zipfile
from pathlib import Path

MAX_BYTES = 2 * 1024 ** 3  # 2 GB total uncompressed, default cap
MAX_RATIO = 100            # reject > 100:1 compression ratio (a likely decompression bomb)
MAX_FILES = 100_000        # entry-count cap, independent of total size

ARCHIVE_SUFFIXES = (".zip", ".tar", ".tar.gz", ".tgz")


class UnsafeArchive(Exception):
    """A clear, user-facing reason an archive was refused. Never a bare stack trace."""


def _ratio_check(compressed: int, uncompressed: int, max_ratio: int) -> None:
    if compressed > 0 and uncompressed / compressed > max_ratio:
        raise UnsafeArchive(f"compression ratio exceeds {max_ratio}:1 (likely a decompression bomb)")


def _inside(dest: Path, target: Path) -> bool:
    target = target.resolve()
    return target == dest or dest in target.parents


def extract_zip(path: Path, dest: Path, max_bytes: int = MAX_BYTES, max_ratio: int = MAX_RATIO,
                 max_files: int = MAX_FILES) -> int:
    """Extract a .zip into `dest` (must already exist). Returns bytes written. Never follows a symlink
    out of `dest`: zipfile writes entry bytes as plain files, so a "symlink" entry cannot create one."""
    dest = dest.resolve()
    try:
        with zipfile.ZipFile(path) as zf:
            infos = zf.infolist()
            if len(infos) > max_files:
                raise UnsafeArchive(f"archive has more than {max_files} entries")
            compressed_total = sum(i.compress_size for i in infos)
            uncompressed_total = sum(i.file_size for i in infos)
            _ratio_check(compressed_total, uncompressed_total, max_ratio)
            if uncompressed_total > max_bytes:
                raise UnsafeArchive(f"uncompressed size exceeds {max_bytes} bytes")
            written = 0
            for info in infos:
                target = dest / info.filename
                if not _inside(dest, target):
                    raise UnsafeArchive(f"archive entry escapes the extraction folder: {info.filename}")
                if info.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info) as src, open(target, "wb") as out:
                    chunk = src.read(1024 * 1024)
                    while chunk:
                        written += len(chunk)
                        if written > max_bytes:
                            raise UnsafeArchive(f"uncompressed size exceeds {max_bytes} bytes")
                        out.write(chunk)
                        chunk = src.read(1024 * 1024)
            return written
    except zipfile.BadZipFile as e:
        raise UnsafeArchive(f"not a valid zip archive: {e}") from e


def extract_tar(path: Path, dest: Path, max_bytes: int = MAX_BYTES, max_ratio: int = MAX_RATIO,
                 max_files: int = MAX_FILES) -> int:
    """Extract a .tar/.tar.gz/.tgz into `dest` (must already exist). Returns bytes written.
    Python 3.12's tarfile "data" filter rejects path traversal and symlinks/hardlinks that would land
    outside `dest`, and strips device/fifo entries and dangerous permission bits."""
    dest = dest.resolve()
    compressed_total = path.stat().st_size
    try:
        with tarfile.open(path, "r:*") as tf:
            members = tf.getmembers()
            if len(members) > max_files:
                raise UnsafeArchive(f"archive has more than {max_files} entries")
            uncompressed_total = sum(m.size for m in members if m.isfile())
            _ratio_check(compressed_total, uncompressed_total, max_ratio)
            if uncompressed_total > max_bytes:
                raise UnsafeArchive(f"uncompressed size exceeds {max_bytes} bytes")
            try:
                tf.extractall(dest, filter="data")
            except tarfile.OutsideDestinationError as e:
                raise UnsafeArchive(f"archive entry escapes the extraction folder: {e}") from e
            except tarfile.LinkOutsideDestinationError as e:
                raise UnsafeArchive(f"archive contains a symlink that escapes the extraction folder: {e}") from e
            except tarfile.FilterError as e:
                raise UnsafeArchive(f"archive entry rejected: {e}") from e
            return uncompressed_total
    except tarfile.TarError as e:
        raise UnsafeArchive(f"not a valid tar archive: {e}") from e


def extract(path: Path, dest: Path, **caps) -> int:
    """Dispatch by extension. `dest` is created if missing; the caller owns removing it after scanning."""
    dest = Path(dest)
    dest.mkdir(parents=True, exist_ok=True)
    name = path.name.lower()
    if name.endswith(".zip"):
        return extract_zip(path, dest, **caps)
    if name.endswith((".tar", ".tar.gz", ".tgz")):
        return extract_tar(path, dest, **caps)
    raise UnsafeArchive(f"unsupported archive type: {path.name}")
