import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import Pipeline from "../components/Pipeline.jsx";

const POLL_MS = 500;

export default function NewScan({ summary, onScanned }) {
  const [path, setPath] = useState(summary?.scan?.target || "");
  const [job, setJob] = useState(null);
  const [err, setErr] = useState("");
  const timer = useRef(null);
  const nav = useNavigate();
  useEffect(() => () => clearTimeout(timer.current), []);

  const poll = (id) => {
    timer.current = setTimeout(async () => {
      try {
        const st = await api.scanStatus(id);
        setJob(st);
        if (st.running) return poll(id);
        if (st.state === "error") return setErr(st.error);
        await onScanned();
        timer.current = setTimeout(() => nav("/"), 900); // let the last stage card be seen
      } catch (e) {
        setErr(e.message);
      }
    }, POLL_MS);
  };

  const start = async (e) => {
    e.preventDefault();
    setErr("");
    setJob(null);
    try {
      const st = await api.scanStart(path);
      setJob(st);
      poll(st.id);
    } catch (e) {
      setErr(e.message);
    }
  };

  const running = job?.running;
  return (
    <div className="p-5 flex flex-col gap-4 max-w-[1300px] mx-auto">
      <form className="card flex flex-col gap-3" onSubmit={start}>
        <div className="h">New scan <span className="dim font-normal">— local folder on this machine; read-only, nothing leaves it</span></div>
        <div className="flex gap-3 items-center flex-wrap">
          <input className="flex-1 mono" style={{ minWidth: 320 }} placeholder="D:\code\my-repo" value={path}
            onChange={(e) => setPath(e.target.value)} disabled={running} />
          <div className="w-40"><button className="btn" disabled={running || !path.trim()}>{running ? "Scanning…" : "Start scan"}</button></div>
        </div>
        {err && <div className="red">{err}</div>}
        {job && <div className="dim text-[12px]">Scanning <span className="mono">{job.path}</span> · {job.state === "done" ? "done — opening Dashboard…" : job.state}</div>}
      </form>
      {job && <Pipeline stages={job.stages} live={job.state} note="live: each stage lights up as it completes (perf_counter)" />}
    </div>
  );
}
