export function UtilitySidebar({
  runStats,
  statusMessage,
  boardJson,
  isAnimating,
  importInputRef,
  selectedAlgorithm,
  allowDiagonal,
  onBoardJsonChange,
  onExportBoard,
  onImportBoardText,
  onOpenImportPicker,
  onImportFile,
}) {
  return (
    <aside className="workspace-panel utility-sidebar">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Utility Rail</p>
          <h2>Reference, progress, and saved boards</h2>
        </div>
        <p className="panel-description">Keep stats, notes, status, and board snapshots close without crowding the grid.</p>
      </div>

      <div className="utility-stack">
        <article className="panel-card utility-combo-card">
          <div className="section-block section-block-compact">
            <div className="section-block-header">
              <p className="panel-kicker">Run Stats</p>
              <h3>What this run produced</h3>
            </div>

            <div className="stats-grid stats-grid-compact">
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
          </div>

          <div className="section-divider" />

          <div className="section-block section-block-compact">
            <div className="section-block-header">
              <p className="panel-kicker">Status</p>
              <h3>Current run feedback</h3>
            </div>
            <p className="status-message">{statusMessage}</p>
          </div>
        </article>

        <article className="panel-card utility-combo-card">
          <div className="section-block section-block-compact">
            <div className="section-block-header">
              <p className="panel-kicker">Learning Notes</p>
              <h3>What to pay attention to</h3>
            </div>

            <div className="learning-list learning-list-compact">
              <p>
                <strong>{selectedAlgorithm.label}</strong> {selectedAlgorithm.summary}
              </p>
              <p>
                Weighted nodes cost <strong>5</strong>. BFS and DFS ignore the extra cost, while
                Dijkstra and A* use it to compare routes.
              </p>
              <p>
                Movement mode:{' '}
                <strong>{allowDiagonal ? '8-directional with blocked-corner rules' : '4-directional only'}</strong>.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          <div className="section-block section-block-compact">
            <div className="section-block-header">
              <p className="panel-kicker">Legend</p>
              <h3>Read the board at a glance</h3>
            </div>

            <div className="legend legend-compact" aria-label="Grid legend">
              <div className="legend-item">
                <span className="legend-swatch start" />
                Start
              </div>
              <div className="legend-item">
                <span className="legend-swatch target" />
                Target
              </div>
              <div className="legend-item">
                <span className="legend-swatch wall" />
                Wall
              </div>
              <div className="legend-item">
                <span className="legend-swatch weight" />
                Weight 5
              </div>
              <div className="legend-item">
                <span className="legend-swatch visited" />
                Visited
              </div>
              <div className="legend-item">
                <span className="legend-swatch path" />
                Final Path
              </div>
            </div>
          </div>
        </article>

        <article className="panel-card import-export-panel utility-combo-card">
          <div className="section-block section-block-compact">
            <div className="section-block-header">
              <p className="panel-kicker">Import / Export</p>
              <h3>Save a scenario or load one back in</h3>
            </div>

            <label className="field import-export-field">
              <span>Board JSON</span>
              <textarea
                className="board-json-input"
                value={boardJson}
                onChange={(event) => onBoardJsonChange(event.target.value)}
                placeholder="Export the current board, or paste a saved board JSON here to import it."
                spellCheck="false"
              />
            </label>

            <div className="import-export-actions">
              <button type="button" className="button-secondary" onClick={onExportBoard} disabled={isAnimating}>
                Export Board
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={onImportBoardText}
                disabled={isAnimating || !boardJson.trim()}
              >
                Import JSON
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={onOpenImportPicker}
                disabled={isAnimating}
              >
                Upload JSON
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="visually-hidden"
                onChange={onImportFile}
              />
            </div>
          </div>
        </article>
      </div>
    </aside>
  );
}
