/** One header for every page (Run A, Task A1). title is phrased as the operator's question. */
export default function PageHeader({ step, title, subtitle, action }) {
  return (
    <div className="page-hd">
      <div style={{ minWidth: 0 }}>
        {step && <div className="page-hd-step">{step}</div>}
        <h1 className="page-hd-title">{title}</h1>
        {subtitle && <div className="page-hd-sub">{subtitle}</div>}
      </div>
      {action && <div className="page-hd-act">{action}</div>}
    </div>
  );
}
