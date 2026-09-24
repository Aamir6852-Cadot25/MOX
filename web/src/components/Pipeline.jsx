import { useEffect, useRef, useState } from "react";

export const STAGES = ["Ingest", "Detect", "Correlate", "Score", "Verdict"];
// Display order matches mox/scanner.py ALL_PLANES.
export const PLANES = ["code", "dependencies", "configs", "certificates", "containers", "binaries", "tls"];
const PLANE_LABEL = { code: "source", dependencies: "deps", configs: "configs", certificates: "certs",
  containers: "containers", binaries: "binaries", tls: "live TLS" };

export const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : ms >= 10 ? `${ms.toFixed(0)} ms` : `${ms.toFixed(2)} ms`);
const nums = (o, keys) => keys.map((k) => o?.[k] ?? 0);

/** Counts `from` down to `to` over ~600 ms when `run` is set; otherwise shows `to` at once. */
function useCountDown(from, to, run) {
  const [v, setV] = useState(run ? from : to);
  const raf = useRef(0);
  useEffect(() => {
    if (!run || from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(to);
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 600);
      setV(Math.round(from - (from - to) * (1 - (1 - k) ** 3)));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [from, to, run]);
  return v;
}

/** Per-plane rows. Live: from progress snapshots; after Detect: from the stored Detect detail. */
function PlaneRows({ detect, progress, disabled }) {
  return (
    <div className="plane-rows">
      {PLANES.map((n) => {
        const d = detect?.[n];
        const p = progress?.[n];
        const status = d ? d.status ?? "ok" : disabled?.includes(n) ? "off" : p ? "run" : detect ? "idle" : "wait";
        const total = d?.files ?? p?.total ?? 0;
        const done = d ? total : p?.done ?? 0;
        const ms = d?.ms ?? p?.ms;
        const bad = status === "failed" || status === "partial";
        return (
          <div key={n} className={`plane-row ${status}`} title={d?.error || p?.error || ""}>
            <span className="pn">{PLANE_LABEL[n]}</span>
            <span className="bar"><i style={{ width: total ? `${(100 * done) / total}%` : status === "ok" ? "100%" : 0 }} /></span>
            <span className="mono pc">{status === "off" ? "off" : d && d.files == null ? `${d.findings} found` : total || p ? `${done}/${total}` : ""}</span>
            <span className="mono pm">{ms != null && status !== "off" ? fmtMs(ms) : ""}</span>
            {bad && <span className="perr">{status === "partial" ? `${d.errors} file(s) failed: ` : ""}{d.error}</span>}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The scan pipeline board. Same component live (New Scan, fed by SSE) and after the scan (Dashboard, from
 * stored stage events). Every number comes from a server event; timings are the scanner's perf_counter values.
 */
export default function Pipeline({ stages, progress, state, error, disabled, net, note = "recorded stage timings, latest scan" }) {
  const got = Object.fromEntries((stages || []).map((s) => [s.stage, s]));
  const live = state === "running" || state === "error" || (state === "done" && !!progress);
  const next = STAGES.find((n) => !got[n]);
  const corr = got.Correlate?.detail;
  const shownAssets = useCountDown(corr?.findings ?? 0, corr?.assets ?? 0, live && !!corr);
  if (!stages?.length && !state)
    return <div className="bp-card"><div className="card-h"><h2>Scan pipeline</h2></div>
      <div className="card-b dim">No stage data for this scan. Run a new scan to record it.</div></div>;

  const cell = (n, i) => {
    const s = got[n];
    const failed = state === "error" && n === next;
    const running = state === "running" && n === next;
    let value = "", desc = "";
    if (s && n === "Ingest") [value, desc] = [`${s.count} files`, "found in target tree"];
    if (s && n === "Detect") [value, desc] = [`${s.count} findings`, "after exact-duplicate removal"];
    if (s && n === "Correlate") [value, desc] = [`${corr.findings} → ${shownAssets}`, "findings correlated into assets"];
    if (s && n === "Score") [value, desc] = [`${s.count} scored`, Object.entries(s.detail).map(([k, v]) => `${k} ${v}`).join(", ")];
    if (s && n === "Verdict") [value, desc] = [nums(s.detail, ["MIGRATE", "CONTAIN", "ACCEPT"]).join(" / "), "migrate / contain / accept"];
    if (!s) [value, desc] = failed ? ["failed", error] : running ? ["running", n === "Detect" ? "planes working" : ""] : ["", "waiting"];
    let fill = s ? 1 : 0;
    if (!s && n === "Detect" && progress) {
      const [d, t] = Object.values(progress).reduce(([a, b], p) => [a + p.done, b + p.total], [0, 0]);
      fill = t ? d / t : 0;
    }
    return (
      <div key={n} className={`stage-c${s ? " done" : ""}${failed ? " failed" : ""}${!s && !running && !failed ? " pending" : ""}`}>
        <div className="st">{i + 1} {n}</div>
        <div className={`sv${n === "Correlate" || n === "Verdict" ? " mono" : ""}`}>{value || " "}</div>
        <div className="sd">{desc}</div>
        {n === "Detect" && (s || progress || state) && <PlaneRows detect={s?.detail}
          progress={progress} disabled={disabled} />}
        <div className="sm mono">{s ? `${fmtMs(s.ms)}  at +${fmtMs(s.t_ms)}` : " "}</div>
        <div className="fill"><i style={{ width: `${fill * 100}%` }} /></div>
      </div>
    );
  };

  return (
    <div className="bp-card">
      <div className="card-h">
        <h2>Scan pipeline</h2>
        <span className="note">{note}</span>
      </div>
      <div className="card-b">
        <div className="pipe">{STAGES.map(cell)}</div>
        {net && (
          <div className={`net-line ${net.outbound ? "bad" : ""}`}>
            {net.guard
              ? <>Socket connects during this scan: <b className="mono">{net.outbound}</b> outbound, <b className="mono">{net.loopback}</b> loopback. Counted by the socket hook in <span className="mono">mox/netguard.py</span>.</>
              : "This scan ran without the socket hook, so outbound connects were not counted."}
          </div>
        )}
      </div>
    </div>
  );
}
