export function StatusPanel({ statusMessage }) {
  return (
    <article className="panel-card utility-panel" aria-live="polite">
      <div className="panel-heading">
        <p className="panel-kicker">Status</p>
        <h3>Current run feedback</h3>
      </div>

      <p className="status-message">{statusMessage}</p>
    </article>
  );
}
