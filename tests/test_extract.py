"""Archive-safety tests (docs/MOX_V2_BUILD_PLAN.md Phase 2): zip-slip, symlink escape, decompression
bombs (size / ratio / file-count caps). A malicious or oversized archive must fail with a clear reason,
never a stack trace."""
import io
import tarfile
import zipfile

import pytest

from mox.extract import UnsafeArchive, extract, extract_tar, extract_zip


def make_zip(path, entries: dict[str, bytes], compression=zipfile.ZIP_DEFLATED):
    with zipfile.ZipFile(path, "w", compression=compression) as zf:
        for name, data in entries.items():
            zf.writestr(name, data)
    return path


def make_tar(path, entries: list[tuple]):
    """entries: (name, data) for a regular file, or (name, None, linkname) for a symlink."""
    with tarfile.open(path, "w") as tf:
        for entry in entries:
            if len(entry) == 2:
                name, data = entry
                info = tarfile.TarInfo(name=name)
                info.size = len(data)
                tf.addfile(info, io.BytesIO(data))
            else:
                name, _, linkname = entry
                info = tarfile.TarInfo(name=name)
                info.type = tarfile.SYMTYPE
                info.linkname = linkname
                tf.addfile(info)
    return path


def test_valid_zip_extracts_every_file(tmp_path):
    z = make_zip(tmp_path / "a.zip", {"one.txt": b"hello", "dir/two.txt": b"world"})
    dest = tmp_path / "out"
    written = extract_zip(z, dest)
    assert (dest / "one.txt").read_bytes() == b"hello"
    assert (dest / "dir" / "two.txt").read_bytes() == b"world"
    assert written == len(b"hello") + len(b"world")


def test_valid_tar_extracts_every_file(tmp_path):
    t = make_tar(tmp_path / "a.tar", [("one.txt", b"hello"), ("dir/two.txt", b"world")])
    dest = tmp_path / "out"
    written = extract_tar(t, dest)
    assert (dest / "one.txt").read_bytes() == b"hello"
    assert (dest / "dir" / "two.txt").read_bytes() == b"world"
    assert written == len(b"hello") + len(b"world")


def test_zip_slip_is_rejected(tmp_path):
    z = make_zip(tmp_path / "evil.zip", {"../../escaped.txt": b"pwned"})
    dest = tmp_path / "sandbox" / "out"
    with pytest.raises(UnsafeArchive, match="escapes"):
        extract_zip(z, dest)
    assert not (tmp_path / "escaped.txt").exists()


def test_zip_slip_absolute_path_is_rejected(tmp_path):
    z = make_zip(tmp_path / "evil2.zip", {"/tmp/escaped2.txt": b"pwned"})
    dest = tmp_path / "sandbox2" / "out"
    with pytest.raises(UnsafeArchive, match="escapes"):
        extract_zip(z, dest)


def test_tar_path_traversal_is_rejected(tmp_path):
    t = make_tar(tmp_path / "evil.tar", [("../../escaped.txt", b"pwned")])
    dest = tmp_path / "sandbox" / "out"
    with pytest.raises(UnsafeArchive, match="escapes"):
        extract_tar(t, dest)
    assert not (tmp_path / "escaped.txt").exists()


def test_tar_symlink_escaping_destination_is_rejected(tmp_path):
    t = make_tar(tmp_path / "evil-link.tar", [("link", None, "/etc/passwd")])
    dest = tmp_path / "sandbox" / "out"
    with pytest.raises(UnsafeArchive):
        extract_tar(t, dest)


def test_tar_symlink_within_destination_is_allowed(tmp_path):
    t = make_tar(tmp_path / "ok-link.tar", [("real.txt", b"hi"), ("link.txt", None, "real.txt")])
    dest = tmp_path / "out"
    extract_tar(t, dest)
    assert (dest / "real.txt").read_bytes() == b"hi"


def test_file_count_cap_is_enforced(tmp_path):
    z = make_zip(tmp_path / "many.zip", {f"f{i}.txt": b"x" for i in range(10)})
    dest = tmp_path / "out"
    with pytest.raises(UnsafeArchive, match="entries"):
        extract_zip(z, dest, max_files=5)


def test_uncompressed_size_cap_is_enforced(tmp_path):
    import os
    z = make_zip(tmp_path / "big.zip", {"big.txt": os.urandom(1000)})  # incompressible: stays under the ratio cap
    dest = tmp_path / "out"
    with pytest.raises(UnsafeArchive, match="size"):
        extract_zip(z, dest, max_bytes=100)


def test_compression_ratio_cap_rejects_a_decompression_bomb(tmp_path):
    # Highly compressible content: 5 MB of zeros compresses far past a 10:1 ratio.
    huge = b"\x00" * (5 * 1024 * 1024)
    z = make_zip(tmp_path / "bomb.zip", {"zeros.bin": huge})
    dest = tmp_path / "out"
    with pytest.raises(UnsafeArchive, match="ratio"):
        extract_zip(z, dest, max_ratio=10, max_bytes=10 * 1024 * 1024 * 1024)


def test_unsupported_extension_is_rejected_cleanly(tmp_path):
    bogus = tmp_path / "not-an-archive.rar"
    bogus.write_bytes(b"whatever")
    with pytest.raises(UnsafeArchive, match="unsupported"):
        extract(bogus, tmp_path / "out")


def test_corrupt_archive_never_raises_a_bare_traceback(tmp_path):
    bogus = tmp_path / "corrupt.zip"
    bogus.write_bytes(b"not a real zip file at all")
    with pytest.raises(UnsafeArchive):
        extract_zip(bogus, tmp_path / "out")


def test_extraction_directory_is_created(tmp_path):
    z = make_zip(tmp_path / "a.zip", {"one.txt": b"hi"})
    dest = tmp_path / "does" / "not" / "exist" / "yet"
    extract(z, dest)
    assert (dest / "one.txt").exists()
