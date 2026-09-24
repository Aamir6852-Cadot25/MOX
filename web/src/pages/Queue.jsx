import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Badge, Evidence, Tier, Verdict } from "../components/Marks.jsx";
import { reducedMotion, token } from "../motion.js";

const TIER_B = { Critical: "crit", High: "high", Medium: "med", Low: "low" };
const TIER_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const EV_RANK = { observed: 4, declared: 3, unverified: 2, textual: 1 };
const V_RANK = { MIGRATE: 3, CONTAIN: 2, ACCEPT: 1 };
const TABS = [["all", "All"], ["MIGRATE", "Migrate"], ["CONTAIN", "Contain"], ["ACCEPT", "Accept"], ["verify", "Verify first"]];
const PLANE_NAME = { code: "source", dependencies: "deps", configs: "config", certificates: "cert", containers: "container",
  binaries: "binary", tls: "live TLS" };
// [key, header, sort value, default direction (-1 = high first), title]
const COLS = [
  ["asset", "Asset", (a) => a.label.toLowerCase(), 1],
  ["wave", "Wave", (a) => a.wave, 1, "Migration wave: 1 goes first. The default order is wave, then risk (the plan)"],
  ["risk", "Risk", (a) => a.score, -1, "Risk score 0–75.6; open an asset for its arithmetic"],
  ["mosca", "Mosca", (a) => a.breakdown.mosca.exposure ?? -Infinity, -1,
    "Mosca exposure in years, X + Y − Z; above 0 means quantum-exposed. n/a: no algorithm identified"],
  ["cmcs", "CMCS", (a) => a.breakdown.cmcs.score, -1, "How hard this asset is to migrate, independent of how risky it is"],
  ["tier", "Tier", (a) => TIER_RANK[a.tier] * 1000 + a.score, -1],
  ["evidence", "Evidence", (a) => EV_RANK[a.breakdown.evidence], -1, "How the crypto was seen; separate from severity"],
  ["verdict", "Verdict", (a) => V_RANK[a.verdict] * 10 - a.wave, -1],
];
const match = (a, t) => t === "all" || (t === "verify" ? a.verify_first : a.verdict === t);
const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

export default function Queue({ summary }) {
  const [params] = useSearchParams();
  const [assets, setAssets] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState(() => (TABS.some(([k]) => k === params.get("verdict")) ? params.get("verdict") : "all"));
  const [q, setQ] = useState("");
  const [ev, setEv] = useState("");
  const [plane, setPlane] = useState("");
  const [sort, setSort] = useState(["wave", 1]); // "What do I do next?" (docs/SCREENS.md): the plan order
  const [sel, setSel] = useState(0);
  const search = useRef(null);
  const body = useRef(null);
  const nav = useNavigate();

  const load = () => { setErr(""); api.assets().then(setAssets).catch((e) => setErr(e.message)); };
  useEffect(load, [summary]);

  const base = useMemo(() => (assets || []).filter((a) => {
    const needle = q.trim().toLowerCase();
    return (!ev || a.breakdown.evidence === ev) && (!plane || a.planes?.includes(plane)) &&
      (!needle || [a.label, a.algorithm, a.tier, a.verdict, ...(a.files || [])].join(" ").toLowerCase().includes(needle));
  }), [assets, q, ev, plane]);
  const rows = useMemo(() => {
    const [k, dir] = sort;
    const f = COLS.find((c) => c[0] === k)[2];
    return base.filter((a) => match(a, tab)).sort((a, b) => {
      const x = f(a), y = f(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir || b.score - a.score;
    });
  }, [base, tab, sort]);
  useEffect(() => setSel((s) => Math.min(s, Math.max(0, rows.length - 1))), [rows.length]);

  // Filter applied (C2): rows that leave fade out over --t-fast, then the list settles over --t-base (FLIP).
  // Only a filter change animates; sorting and data reloads swap the list at once.
  const filterKey = `${tab}|${q}|${ev}|${plane}`;
  const [shown, setShown] = useState(rows);
  const [leaving, setLeaving] = useState(null);
  const lastFilter = useRef(filterKey);
  const tops = useRef(null);
  const measure = () => Object.fromEntries([...(body.current?.querySelectorAll("tr[data-id]") || [])]
    .map((tr) => [tr.dataset.id, tr.getBoundingClientRect().top]));
  useEffect(() => {
    const filtered = lastFilter.current !== filterKey;
    lastFilter.current = filterKey;
    const keep = new Set(rows.map((r) => r.id));
    const gone = shown.filter((r) => !keep.has(r.id)).map((r) => r.id);
    if (!filtered || !gone.length) { tops.current = filtered ? measure() : null; setLeaving(null); return setShown(rows); }
    setLeaving(new Set(gone));
    const t = setTimeout(() => { tops.current = measure(); setLeaving(null); setShown(rows); }, token("--t-fast"));
    return () => clearTimeout(t);
  }, [rows]);
  useLayoutEffect(() => {
    const before = tops.current;
    tops.current = null;
    if (!before || reducedMotion()) return;
    for (const tr of body.current?.querySelectorAll("tr[data-id]") || []) {
      const dy = (before[tr.dataset.id] ?? tr.getBoundingClientRect().top) - tr.getBoundingClientRect().top;
      if (!dy) continue;
      tr.classList.remove("settle");
      tr.style.transform = `translateY(${dy}px)`;
      tr.getBoundingClientRect(); // commit the start position before transitioning to the end
      tr.classList.add("settle");
      tr.style.transform = "";
    }
  }, [shown]);
  useEffect(() => { body.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
      if (e.key === "/" && !typing) { e.preventDefault(); search.current?.focus(); return; }
      if (e.key === "Escape" && typing) { e.target.blur(); return; }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "j") setSel((s) => Math.min(rows.length - 1, s + 1));
      else if (e.key === "k") setSel((s) => Math.max(0, s - 1));
      else if (e.key === "Enter" && rows[sel] && !/^(A|BUTTON)$/.test(e.target.tagName)) nav(`/asset/${rows[sel].id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows, sel, nav]);

  const planes = useMemo(() => [...new Set((assets || []).flatMap((a) => a.planes || []))].sort(), [assets]);
  const firstFix = rows.find((a) => a.verdict === "MIGRATE" && a.fix_finding);
  const clear = () => { setQ(""); setEv(""); setPlane(""); setTab("all"); };
  const sortBy = (k, d) => setSort(([sk, sd]) => (sk === k ? [k, -sd] : [k, d]));

  let empty = null;
  if (err) empty = <div className="errbox">Could not load the work queue: {err}. Check the server is running, then <button className="linkbtn" onClick={load}>retry</button>.</div>;
  else if (!assets) empty = <div className="hint">Loading assets from the latest scan</div>;
  else if (!assets.length) empty = <div className="hint">No assets yet. <Link to="/scan">Start a scan from New Scan</Link> and the queue fills from its results.</div>;
  else if (!rows.length) empty = <div className="hint">No asset matches these filters{q ? <> and the search <span className="mono">{q}</span></> : null}. <button className="linkbtn" onClick={clear}>Clear filters</button> to see all {assets.length}.</div>;

  return (
    <div className="queue">
      <div className="head">
        <h1>Work queue</h1>
        <span className="sub">sorted by {COLS.find((c) => c[0] === sort[0])[1].toLowerCase()}, {sort[1] < 0 ? "highest" : "lowest"} first. Keys: <kbd>j</kbd> <kbd>k</kbd> move, <kbd>Enter</kbd> open, <kbd>/</kbd> search</span>
        <div className="head-act">
          {firstFix && <Link className="bp-btn pri" to={`/fix/${firstFix.fix_finding}`} title={firstFix.label}><Icon name="wrench" />Open first fix</Link>}
        </div>
      </div>
      <div className="filters">
        <input ref={search} className="search" placeholder="Search assets, files, algorithms" aria-label="Search the work queue"
          value={q} onChange={(e) => setQ(e.target.value)} />
        {TABS.map(([k, l]) => (
          <button key={k} className="fchip" aria-pressed={tab === k} onClick={() => setTab(k)}>
            {l} <span className="n mono">{base.filter((a) => match(a, k)).length}</span>
          </button>
        ))}
        <span className="sp" />
        <select aria-label="Filter by evidence" value={ev} onChange={(e) => setEv(e.target.value)} className="fsel">
          <option value="">All evidence</option>
          <option value="observed">Observed</option><option value="declared">Declared</option>
          <option value="unverified">Declared, unverified</option><option value="textual">Textual</option>
        </select>
        <select aria-label="Filter by plane" value={plane} onChange={(e) => setPlane(e.target.value)} className="fsel">
          <option value="">All planes</option>
          {planes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="legend">
        Evidence is separate from severity. <b>Observed</b> parsed certificate or TLS handshake. <b>Declared</b> named in code or config.
        <b> Declared, unverified</b> a dependency or package that can do it; use not proven, so it stays in Verify first. <b>Textual</b> a string match in bytes.
      </div>
      <div className="qbody" ref={body}>
        <table className="qt">
          <thead>
            <tr>
              {COLS.map(([k, h, , d, title]) => (
                <th key={k} className={`c-${k}`} aria-sort={sort[0] === k ? (sort[1] < 0 ? "descending" : "ascending") : "none"}>
                  <button onClick={() => sortBy(k, d)} title={title}>{h}{sort[0] === k && <Icon name={sort[1] < 0 ? "chevron-down" : "chevron-up"} />}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((a, i) => {
              const b = a.breakdown, e = b.mosca.exposure;
              return (
                <tr key={a.id} data-i={i} data-id={a.id} className={leaving?.has(a.id) ? "leaving" : undefined} aria-selected={shown === rows && i === sel} onClick={() => { setSel(i); nav(`/asset/${a.id}`); }}>
                  <td className="c-asset">
                    <Link to={`/asset/${a.id}`} className="a1 mono" tabIndex={-1}>{a.label}</Link>
                    <div className="a2">
                      <span className="mono">{a.summary}</span>
                      {(a.planes || []).map((p) => <Badge key={p}>{PLANE_NAME[p] || p}</Badge>)}
                      {a.verify_first && <Badge family="high">Verify first</Badge>}
                    </div>
                  </td>
                  <td className="num mono">{a.wave}</td>
                  <td className="num mono" style={{ color: `var(--${TIER_B[a.tier]}-ink)` }}>{a.score}</td>
                  <td className={`num mono${e > 0 ? " exp" : ""}`} title={e == null ? b.mosca.reason : undefined}>
                    {e == null ? <span className="of">n/a</span> : signed(e)}</td>
                  <td className="num mono">{b.cmcs.score}<span className="of">/10</span></td>
                  <td><Tier tier={a.tier} /></td>
                  <td><Evidence grade={b.evidence} label={b.evidence_label} /></td>
                  <td><Verdict verdict={a.verdict} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {empty && <div className="qempty">{empty}</div>}
      </div>
      <div className="qfoot">
        <span>Showing <span className="mono">{rows.length}</span> of <span className="mono">{assets?.length ?? 0}</span> assets</span>
        {rows[sel] && <span>Selected: <span className="mono">{rows[sel].label}</span></span>}
      </div>
    </div>
  );
}
