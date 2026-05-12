import { useBoardZoom } from '../hooks/useBoardZoom';
import { NodeCell } from './NodeCell';

function ZoomButton({ children, disabled = false, onClick }) {
  return (
    <button type="button" className="button-secondary zoom-button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function GridBoard({ grid, onCellMouseDown, onCellMouseEnter }) {
  const { zoom, viewportRef, gridRef, handleZoomIn, handleZoomOut, handleFitBoard } = useBoardZoom();

  return (
    <section className="workspace-panel board-panel">
      <div className="board-header">
        <div className="board-header-main">
          <div>
            <p className="panel-kicker">Grid Board</p>
            <h2>Build a scenario, then watch the search unfold.</h2>
          </div>

          <div className="board-zoom-controls" role="toolbar" aria-label="Grid zoom controls">
            <ZoomButton onClick={handleZoomOut}>Zoom -</ZoomButton>
            <ZoomButton onClick={handleZoomIn}>Zoom +</ZoomButton>
            <ZoomButton onClick={handleFitBoard}>Fit Board</ZoomButton>
          </div>
        </div>

        <p className="board-help">
          Click and drag to paint. Drag the start or target nodes to reposition them. The board is
          centered and scaled to stay visible by default, and you can zoom in when you want a
          closer look.
        </p>
      </div>

      <div ref={viewportRef} className="board-scroll">
        <div
          ref={gridRef}
          className="grid"
          style={{ '--board-zoom': zoom }}
          role="grid"
          aria-label="Pathfinding grid"
        >
          {grid.map((row) =>
            row.map((node) => (
              <NodeCell
                key={`${node.row}-${node.col}`}
                node={node}
                onMouseDown={onCellMouseDown}
                onMouseEnter={onCellMouseEnter}
              />
            )),
          )}
        </div>
      </div>
    </section>
  );
}
