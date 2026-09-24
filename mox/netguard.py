"""Air-gap evidence: count every outbound socket connect this process makes, and show which planes can open one.

install() wraps socket.socket.connect/connect_ex once per process. Loopback (127.0.0.0/8, ::1, localhost) is
counted separately from everything else, so the UI can say "0 outbound calls" and mean it.
plane_sockets() reads each plane module's source with ast, so the "can open a socket" claim is derived from the
code the scanner actually runs, not from a hand-written list.
"""
import ast
import ipaddress
import socket
import threading
import time
from pathlib import Path

NET_MODULES = {"socket", "ssl", "http", "urllib", "ftplib", "smtplib", "asyncio", "requests", "httpx"}

_lock = threading.Lock()
_state = {"installed": False, "since": None, "outbound": 0, "loopback": 0, "last": None}


def _is_loopback(addr) -> bool:
    host = addr[0] if isinstance(addr, tuple) else addr
    if not isinstance(host, str):
        return False  # AF_UNIX and friends never reach here with a tuple; treat unknowns as outbound
    if host.lower() == "localhost":
        return True
    try:
        return ipaddress.ip_address(host.split("%")[0]).is_loopback
    except ValueError:
        return False  # a hostname that still needs resolving: count it as outbound


def _record(sock, addr) -> None:
    if sock.family not in (socket.AF_INET, socket.AF_INET6):
        return
    with _lock:
        if _is_loopback(addr):
            _state["loopback"] += 1
        else:
            _state["outbound"] += 1
            _state["last"] = {"host": str(addr[0]) if isinstance(addr, tuple) else str(addr),
                              "at": time.strftime("%Y-%m-%dT%H:%M:%S")}


def install() -> None:
    with _lock:
        if _state["installed"]:
            return
        _state.update(installed=True, since=time.strftime("%Y-%m-%dT%H:%M:%S"))
    connect, connect_ex = socket.socket.connect, socket.socket.connect_ex

    def counted_connect(self, addr):
        _record(self, addr)
        return connect(self, addr)

    def counted_connect_ex(self, addr):
        _record(self, addr)
        return connect_ex(self, addr)

    socket.socket.connect, socket.socket.connect_ex = counted_connect, counted_connect_ex


def counts() -> dict:
    with _lock:
        return dict(_state)


def _imports(path: Path) -> list[str]:
    found = set()
    for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
        if isinstance(node, ast.Import):
            found |= {a.name.split(".")[0] for a in node.names}
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            found.add(node.module.split(".")[0])
    return sorted(found & NET_MODULES)


def plane_sockets() -> list[dict]:
    from .scanner import ALL_PLANES
    out = []
    for mod in ALL_PLANES:
        src = Path(mod.__file__)
        nets = _imports(src)
        out.append({"plane": mod.NAME, "opens_socket": bool(nets), "imports": nets,
                    "source": f"mox/planes/{src.name}"})
    return out
