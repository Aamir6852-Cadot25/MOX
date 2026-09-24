"""mox/source.py: every Scan-page source kind resolves to a real directory + a cleanup (Phase 2)."""
import subprocess
import zipfile

import pytest

from mox import extract, gitsource, source


def test_from_folder_resolves_and_needs_no_cleanup(tmp_path):
    r = source.from_folder(str(tmp_path))
    assert r.path == tmp_path.resolve()
    assert r.meta["source_kind"] == "folder"
    r.cleanup()  # no-op; the user's own folder must still exist
    assert tmp_path.exists()


def test_from_folder_rejects_a_missing_path(tmp_path):
    with pytest.raises(source.SourceError, match="does not exist"):
        source.from_folder(str(tmp_path / "nope"))


def test_from_upload_archive_extracts_into_a_temp_dir_and_cleans_up(tmp_path):
    z = tmp_path / "a.zip"
    with zipfile.ZipFile(z, "w") as zf:
        zf.writestr("cert.pem", b"-----BEGIN CERTIFICATE-----\n")
    r = source.from_upload("archive", [("a.zip", z.read_bytes())])
    assert (r.path / "cert.pem").read_bytes().startswith(b"-----BEGIN")
    assert r.meta["source_kind"] == "archive"
    saved = r.path
    r.cleanup()
    assert not saved.exists()


def test_from_upload_archive_rejects_a_malicious_zip_and_cleans_up(tmp_path):
    z = tmp_path / "evil.zip"
    with zipfile.ZipFile(z, "w") as zf:
        zf.writestr("../../escaped.txt", b"pwned")
    with pytest.raises(extract.UnsafeArchive):
        source.from_upload("archive", [("evil.zip", z.read_bytes())])
    assert not (tmp_path / "escaped.txt").exists()


def test_from_upload_container_places_the_tar_for_the_containers_plane():
    r = source.from_upload("container", [("image.tar", b"not a real tar, just placed as-is")])
    assert (r.path / "image.tar").read_bytes() == b"not a real tar, just placed as-is"
    assert r.meta["source_kind"] == "container"
    r.cleanup()


def test_from_upload_container_rejects_non_tar_files():
    with pytest.raises(source.SourceError, match="docker save"):
        source.from_upload("container", [("image.zip", b"nope")])


def test_from_upload_artefacts_places_every_file_by_its_own_name(tmp_path):
    files = [("a.crt", b"cert-bytes"), ("b.jar", b"jar-bytes")]
    r = source.from_upload("artefacts", files)
    assert (r.path / "a.crt").read_bytes() == b"cert-bytes"
    assert (r.path / "b.jar").read_bytes() == b"jar-bytes"
    r.cleanup()


def test_from_upload_artefacts_never_lets_a_filename_escape_the_temp_dir():
    r = source.from_upload("artefacts", [("../../evil.crt", b"pwned")])
    assert (r.path / "evil.crt").exists()
    assert not (r.path.parent.parent / "evil.crt").exists()
    r.cleanup()


def test_from_upload_rejects_unknown_kind():
    with pytest.raises(source.SourceError, match="unknown"):
        source.from_upload("nonsense", [("x", b"y")])


def test_from_upload_rejects_empty_file_list():
    with pytest.raises(source.SourceError, match="no file"):
        source.from_upload("archive", [])


def _init_repo(path):
    path.mkdir()
    subprocess.run(["git", "init", "-q"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.email", "t@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=path, check=True)
    (path / "a.py").write_text("x = 1\n")
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "init"], cwd=path, check=True)
    return path


def test_from_git_local_records_the_commit_sha(tmp_path):
    repo = _init_repo(tmp_path / "repo")
    r = source.from_git(str(repo), None, authorized=False)
    assert r.path == repo.resolve()
    assert r.meta["commit"] == gitsource.commit_sha(repo)
    r.cleanup()
    assert repo.exists()  # the user's own clone is never removed


def test_from_git_remote_requires_authorisation(tmp_path):
    repo = _init_repo(tmp_path / "repo")
    with pytest.raises(gitsource.GitError, match="authoris"):
        source.from_git(None, f"file://{repo}", authorized=False)


def test_from_git_remote_clones_and_cleans_up(tmp_path):
    repo = _init_repo(tmp_path / "repo")
    r = source.from_git(None, f"file://{repo}", authorized=True)
    assert (r.path / "a.py").exists()
    assert r.meta["commit"] == gitsource.commit_sha(repo)
    saved = r.path
    r.cleanup()
    assert not saved.exists()


def test_tls_only_source_is_an_empty_directory_that_cleans_up():
    r = source.tls_only()
    assert r.path.is_dir() and not list(r.path.iterdir())
    saved = r.path
    r.cleanup()
    assert not saved.exists()
