// Summary card styled to sit next to Polaris sections. Uses the tokens copied
// into app/styles/app.css because Polaris doesn't ship a "metric" card.
export function StatCard({ label, value, hint = null, highlight = false }) {
  return (
    <div className={highlight ? "stat-card stat-card--brand" : "stat-card"}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint ? <p className="stat-card__hint">{hint}</p> : null}
    </div>
  );
}
