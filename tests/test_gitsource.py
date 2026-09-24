"""Git repository source (Phase 2, D1): local clone commit SHA, remote clone opt-in + netguard counting."""
import subprocess

import pytest

from mox import gitsource, netguard


def _init_repo(path):
    path.mkdir()
    subprocess.run(["git", "init", "-q"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.email", "t@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=path, check=True)
    (path / "a.py").write_text("x = 1\n")
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "init"], cwd=path, check=True)
    return path


def test_commit_sha_reads_the_checked_out_commit(tmp_path):
    repo = _init_repo(tmp_path / "repo")
    sha = gitsource.commit_sha(repo)
    assert sha and len(sha) == 40


def test_commit_sha_is_none_outside_a_git_repo(tmp_path):
    plain = tmp_path / "plain"
    plain.mkdir()
    assert gitsource.commit_sha(plain) is None


def test_remote_clone_requires_explicit_authorisation(tmp_path):
    repo = _init_repo(tmp_path / "repo")
    with pytest.raises(gitsource.GitError, match="authoris"):
        gitsource.clone_remote(f"file://{repo}", tmp_path / "clone", authorized=False)
    assert not (tmp_path / "clone").exists()


def test_remote_clone_rejects_a_non_url_string(tmp_path):
    with pytest.raises(gitsource.GitError, match="not a git remote URL"):
        gitsource.clone_remote("not-a-url", tmp_path / "clone", authorized=True)


def test_authorised_remote_clone_is_counted_by_netguard(tmp_path):
    repo = _init_repo(tmp_path / "repo")
    before = netguard.counts()["outbound"]
    sha = gitsource.clone_remote(f"file://{repo}", tmp_path / "clone", authorized=True)
    after = netguard.counts()["outbound"]
    assert after == before + 1
    assert sha == gitsource.commit_sha(repo)
    assert (tmp_path / "clone" / "a.py").exists()
