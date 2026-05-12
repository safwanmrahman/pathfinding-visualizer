export function StatsPanel({ runStats }) {
  return (
    <article className="panel-card stats-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Run Stats</p>
        <h3>What this run produced</h3>
      </div>

      <div className="stats-grid">
        <div>
          <span className="stat-value">{runStats.visitedNodes}</span>
          <span className="stat-label">Visited Nodes</span>
        </div>
        <div>
          <span className="stat-value">{runStats.pathLength}</span>
          <span className="stat-label">Path Length</span>
        </div>
        <div>
          <span className="stat-value">{runStats.pathCost}</span>
          <span className="stat-label">Path Cost</span>
        </div>
        <div>
          <span className="stat-value">{runStats.completedRuns}</span>
          <span className="stat-label">Completed Runs</span>
        </div>
        <div className="stat-wide">
          <span className="stat-value stat-value-small">{runStats.lastAlgorithm}</span>
          <span className="stat-label">Last Algorithm</span>
        </div>
      </div>
    </article>
  );
}
