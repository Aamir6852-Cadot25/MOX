import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Folder, ArrowUp, X, Check } from "lucide-react";

export default function BrowseModal({ isOpen, initialPath, onSelect, onClose }) {
  const [currentPath, setCurrentPath] = useState(initialPath || "");
  const [dirs, setDirs] = useState([]);
  const [parentPath, setParentPath] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPath(initialPath || "");
    }
  }, [isOpen, initialPath]);

  const loadPath = async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.browse(p);
      if (res.error) {
        setError(res.error);
      } else {
        setCurrentPath(res.path || p);
        setDirs(res.dirs || []);
        setParentPath(res.parent);
      }
    } catch (err) {
      setError(err.message || "Failed to browse directory");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="mc" style={{ width: "560px" }}>
        <div className="row" style={{ marginBottom: "14px" }}>
          <b style={{ fontSize: "16px" }}>Select Project Folder</b>
          <button className="ib" style={{ marginLeft: "auto", color: "var(--mut)" }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div className="row" style={{ gap: "8px" }}>
            <input
              className="in mono"
              value={currentPath}
              onChange={(e) => setCurrentPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadPath(currentPath);
              }}
              placeholder="Path..."
            />
            {parentPath && (
              <button
                className="btn"
                onClick={() => loadPath(parentPath)}
                title="Go to parent folder"
                style={{ padding: "8px 12px" }}
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
          {error && <div style={{ color: "var(--p1)", fontSize: "12px", marginTop: "6px" }}>{error}</div>}
        </div>

        <div
          style={{
            border: "1px solid var(--bd)",
            borderRadius: "8px",
            maxHeight: "260px",
            overflowY: "auto",
            background: "#FAFBFC",
            padding: "6px",
          }}
        >
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--mut)" }}>Loading…</div>
          ) : dirs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--mut)" }}>No subdirectories found</div>
          ) : (
            dirs.map((d) => (
              <div
                key={d.path}
                className="row"
                style={{
                  padding: "7px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#EEF4F9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => loadPath(d.path)}
              >
                <Folder size={16} style={{ color: "var(--cy)", flexShrink: 0 }} />
                <span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.name}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px" }}>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn pri"
            onClick={() => {
              onSelect(currentPath);
              onClose();
            }}
          >
            <Check size={15} /> Select this folder
          </button>
        </div>
      </div>
    </div>
  );
}
