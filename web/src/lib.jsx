import { useEffect, useState } from "react";

export const PAGE = 10;

/** Search + pagination over a list; `text(item)` gives the searchable string. Returns view state for <Pager>. */
export function usePaged(items, text) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const [page, setPage] = useState(0);
  const f = q.trim().toLowerCase();
  const hit = f ? items.filter((x) => text(x).toLowerCase().includes(f)) : items;
  useEffect(() => setPage(0), [q, items.length]);
  const pages = Math.max(1, Math.ceil(hit.length / PAGE));
  const shown = all ? hit : hit.slice(page * PAGE, page * PAGE + PAGE);
  return { q, setQ, all, setAll, page, setPage, pages, shown, total: hit.length };
}

export function Search({ p, placeholder = "Search…" }) {
  return <input className="w-56" placeholder={placeholder} value={p.q} onChange={(e) => p.setQ(e.target.value)} />;
}

export function Pager({ p }) {
  if (p.total <= PAGE) return null;
  return (
    <div className="pager">
      <span>{p.all ? `Showing all ${p.total}` : `${p.page * PAGE + 1}–${Math.min(p.total, p.page * PAGE + PAGE)} of ${p.total}`}</span>
      <span className="flex gap-2">
        {!p.all && <button className="filt" disabled={p.page === 0} onClick={() => p.setPage(p.page - 1)}>Prev</button>}
        {!p.all && <button className="filt" disabled={p.page >= p.pages - 1} onClick={() => p.setPage(p.page + 1)}>Next</button>}
        <button className="filt" onClick={() => p.setAll(!p.all)}>{p.all ? "Show pages" : `View all ${p.total}`}</button>
      </span>
    </div>
  );
}
