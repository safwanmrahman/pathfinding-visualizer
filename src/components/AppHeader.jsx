function HeaderMetaCard({ label, value }) {
  return (
    <div className="header-meta-card">
      <span className="hero-note-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AppHeader({ allowDiagonal, selectedTool }) {
  const currentToolLabel =
    selectedTool === 'wall'
      ? 'Wall drawing'
      : selectedTool === 'weight'
        ? 'Weighted terrain'
        : 'Eraser';

  return (
    <header className="hero">
      <p className="hero-kicker">Pathfinding Visualizer</p>
      <h1>Compare search strategies on a board you shape yourself.</h1>
      <p className="hero-copy">
        Draw walls, add weighted terrain, move the start and target nodes, and study how each
        algorithm explores the same challenge from a different perspective.
      </p>

      <div className="hero-metadata">
        <HeaderMetaCard label="Learning Focus" value="Traversal order, path cost, and route quality" />
        <HeaderMetaCard
          label="Board Rules"
          value={allowDiagonal ? '8-way movement, no corner cutting' : '4-way movement only'}
        />
        <HeaderMetaCard label="Current Tool" value={currentToolLabel} />
      </div>
    </header>
  );
}
