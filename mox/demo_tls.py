"""`python -m mox demo-tls` - serve the demo api-gw certificate on 127.0.0.1:8443 for the live probe."""
import socket
import ssl
from pathlib import Path


def make_server(cert: Path, key: Path, host: str = "127.0.0.1", port: int = 8443):
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(str(cert), str(key))
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((host, port))
    sock.listen(5)
    return ctx.wrap_socket(sock, server_side=True)


def serve_forever(server) -> None:
    while True:
        try:
            conn, _ = server.accept()
            conn.close()
        except (ssl.SSLError, ConnectionError, socket.timeout):
            continue
        except OSError:
            return


def run(demo_dir: Path, host: str = "127.0.0.1", port: int = 8443) -> None:
    cert, key = demo_dir / "certs" / "api-gw.crt", demo_dir / "certs" / "api-gw.key"
    if not cert.exists():
        raise SystemExit(f"{cert} not found - run `python -m mox make-demo` first")
    server = make_server(cert, key, host, port)
    print(f"demo TLS endpoint serving api-gw cert on {host}:{port} (Ctrl+C to stop)")
    try:
        serve_forever(server)
    except KeyboardInterrupt:
        pass
