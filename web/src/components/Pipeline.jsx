const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : ms >= 10 ? `${ms.toFixed(0)} ms` : `${ms.toFixed(2)} ms`);
const join = (o) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(" · ");
const STAGE_TEXT = {
  Ingest: (s) => [`${s.count} files`, "found in target tree"],
  Detect: (s) => [`${s.count} findings`, Object.entries(s.detail).filter(([, p]) => p.findings).map(([k, p]) => `${k} ${p.findings} (${fmtMs(p.ms)})`).join(" · ")],
  Correlate: (s) => [`${s.detail.findings} → ${s.detail.assets}`, "raw findings → assets"],
  Score: (s) => [`${s.count} scored`, join(s.detail)],
  Verdict: (s) => [join(s.detail) || "0", "at scan time"],
};

export const STAGES = ["Ingest", "Detect", "Correlate", "Score", "Verdict"];

/** 5 pipeline cards. `live`: show all 5 slots, pending ones dimmed until their real event arrives. */
export default function Pipeline({ stages, live, note = "recorded stage timings from the latest scan (perf_counter)" }) {
  const got = Object.fromEntries((stages || []).map((s) => [s.stage, s]));
  const names = live ? STAGES : (stages || []).map((s) => s.stage);
  const next = STAGES.find((n) => !got[n]);
  return (
    <div className="card">
      <div className="h mb-2">Pipeline <span className="dim font-normal">— {note}</span></div>
      {!names.length ? <div className="dim">No stage data for this scan — re-scan to record it.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {names.map((n, i) => {
            const s = got[n];
            if (!s)
              return (
                <div key={n} className="node" style={{ padding: 10, opacity: 0.45 }}>
                  <div className="p">{i + 1}. {n}</div>
                  <div className="text-lg font-bold">—</div>
                  <div className="dim text-[11px]">{live === "running" && n === next ? "running…" : "pending"}</div>
                </div>
              );
            const [main, sub] = STAGE_TEXT[n]?.(s) ?? [s.count, ""];
            return (
              <div key={n} className="node relative" style={{ padding: 10, ...(live ? { borderColor: "#2E9E5B" } : {}) }}>
                <div className="p">{i + 1}. {n}</div>
                <div className="text-lg font-bold">{main}</div>
                <div className="dim text-[11px]">{sub}</div>
                <div className="mono text-[11px] mt-1">{fmtMs(s.ms)} <span className="dim">· t+{fmtMs(s.t_ms)}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
