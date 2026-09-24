import { useState } from "react";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      onLogin(await api.login(u, p));
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="panel p-8 w-[360px] flex flex-col gap-3">
        <div className="logo text-3xl"><span className="m">MO</span><span className="x">X</span></div>
        <div className="dim mb-2">Quantum-vulnerable crypto scanner · offline</div>
        <input placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} autoFocus />
        <input placeholder="Password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
        {err && <div className="red">{err}</div>}
        <button className="btn" type="submit">Sign in</button>
        <div className="dim text-[11px]">Accounts are created by an operator with <span className="mono">python -m mox create-admin</span>.</div>
      </form>
    </div>
  );
}
