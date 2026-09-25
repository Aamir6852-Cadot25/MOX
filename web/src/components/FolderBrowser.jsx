import { useEffect, useState } from "react";
import { api } from "../api.js";
import Icon from "./Icon.jsx";

/** Server-side directory browse: MOX runs on the machine it scans, so it can list local folders
 * directly (mox/browse.py). Breadcrumb navigation + a folder list, not a full OS-native dialog. */
export default function FolderBrowser({ start, onSelect, onClose }) {
  const [r, setR] = useState(null);
  const [err, setErr] = useState("");

  const go = (path) => {
    setErr("");
    api.browse(path).then((d) => (d.error ? setErr(d.error) : setR(d))).catch((e) => setErr(e.message));
  };
  useEffect(() => go(start), []); // eslint-disable-line react-hooks/exhaustive-deps

  const parts = r ? r.path.split(/([\\/])/).filter(Boolean) : [];
  const crumbTo = (i) => parts.slice(0, i + 1).join("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <Icon name="folder" />
          <div className="h" style={{ margin: 0 }}>Choose a folder</div>
          <div className="sp" style={{ flex: 1 }} />
          <button type="button" className="linkbtn" onClick={onClose}>Close</button>
        </div>
        <div className="modal-crumbs mono">
          {r ? parts.map((p, i) => (/[\\/]/.test(p)
            ? <span key={i}>{p}</span>
            : <button key={i} type="button" onClick={() => go(crumbTo(i))}>{p}</button>
          )) : <span className="dim">Loading…</span>}
        </div>
        <div className="modal-list">
          {err && <div className="errbox" style={{ margin: "var(--s2) var(--s4)" }}>{err}</div>}
          {r && r.parent && (
            <button type="button" className="modal-row" onClick={() => go(r.parent)}>
              <Icon name="corner-left-up" />..</button>
          )}
          {r && r.dirs.map((d) => (
            <button key={d.path} type="button" className="modal-row" onClick={() => go(d.path)}>
              <Icon name="folder" />{d.name}
            </button>
          ))}
          {r && !r.dirs.length && !r.parent && <div className="hint" style={{ padding: "var(--s2) var(--s4)" }}>No subfolders here.</div>}
        </div>
        <div className="modal-foot">
          <span className="dim mono" style={{ flex: 1, alignSelf: "center", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{r?.path}</span>
          <button type="button" className="bp-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="bp-btn pri" disabled={!r} onClick={() => r && onSelect(r.path)}>Select this folder</button>
        </div>
      </div>
    </div>
  );
}
