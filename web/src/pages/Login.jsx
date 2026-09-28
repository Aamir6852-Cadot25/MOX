import React, { useState } from "react";
import { api } from "../api";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(username, password);
      onLoginSuccess(res);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login">
      <div className="lc">
        <div className="row">
          <div className="logo" style={{ color: "#fff" }}>
            MX
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "17px" }}>M-O-X</div>
            <div style={{ fontSize: "12px", color: "var(--mut)" }}>
              Cryptographic discovery &amp; PQC readiness
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: "22px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label className="f">Username</label>
            <input
              className="in"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="f">Password</label>
            <input
              className="in"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ color: "var(--p1)", fontSize: "12px", marginBottom: "14px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn pri"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "11px" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p style={{ fontSize: "11.5px", color: "var(--mut)", textAlign: "center", margin: "14px 0 0" }}>
            Accounts are created by an administrator.
          </p>
        </form>
      </div>
    </div>
  );
}
