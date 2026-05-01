import { useEffect, useMemo, useRef, useState } from 'react';
import { algorithms } from './algorithms';
import {
  DEFAULT_START,
  DEFAULT_TARGET,
  clearWalls,
  createGrid,
  moveSpecialNode,
  resetSearchState,
  updateWall,
} from './grid';

const VISIT_DELAY_MS = 12;
const PATH_DELAY_MS = 35;
const DEFAULT_STATS = {
  visitedNodes: 0,
  pathLength: 0,
  completedRuns: 0,
  lastAlgorithm: 'None yet',
};

function sleep(delay) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

function App() {
  const animationRunIdRef = useRef(0);
  const [startNode, setStartNode] = useState(DEFAULT_START);
  const [targetNode, setTargetNode] = useState(DEFAULT_TARGET);
  const [grid, setGrid] = useState(() => createGrid(DEFAULT_START, DEFAULT_TARGET));
  const [algorithmKey, setAlgorithmKey] = useState('bfs');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [runStats, setRunStats] = useState(DEFAULT_STATS);
  const [statusMessage, setStatusMessage] = useState(
    'Draw walls, drag the start/target nodes, then visualize an algorithm.',
  );

  useEffect(() => {
    function handleMouseUp() {
      setIsMouseDown(false);
      setDragMode(null);
    }

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const algorithmOptions = useMemo(() => Object.entries(algorithms), []);
  const selectedAlgorithm = algorithms[algorithmKey];

  function clearPath() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setGrid((currentGrid) => resetSearchState(currentGrid));
    setStatusMessage('Cleared the previous search path.');
  }

  function resetBoard() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setGrid(createGrid(DEFAULT_START, DEFAULT_TARGET));
    setStartNode(DEFAULT_START);
    setTargetNode(DEFAULT_TARGET);
    setRunStats(DEFAULT_STATS);
    setStatusMessage('Board reset to the default layout.');
  }

  function clearAllWalls() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setGrid((currentGrid) => clearWalls(currentGrid, startNode, targetNode));
    setStatusMessage('Removed all walls from the grid.');
  }

  function stopVisualization() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setStatusMessage('Visualization stopped. You can resume with another run or edit the board.');
  }

  function handleCellMouseDown(row, col) {
    if (isAnimating) {
      return;
    }

    const node = grid[row][col];
    setIsMouseDown(true);

    if (node.isStart) {
      setDragMode('move-start');
      return;
    }

    if (node.isTarget) {
      setDragMode('move-target');
      return;
    }

    const nextIsWall = !node.isWall;
    setDragMode(nextIsWall ? 'draw-wall' : 'erase-wall');
    setGrid((currentGrid) => updateWall(resetSearchState(currentGrid), row, col, nextIsWall));
  }

  function handleCellMouseEnter(row, col) {
    if (!isMouseDown || isAnimating || !dragMode) {
      return;
    }

    const node = grid[row][col];

    if (dragMode === 'move-start') {
      if (node.isTarget) {
        return;
      }

      setGrid((currentGrid) => moveSpecialNode(currentGrid, startNode, { row, col }, 'isStart'));
      setStartNode({ row, col });
      return;
    }

    if (dragMode === 'move-target') {
      if (node.isStart) {
        return;
      }

      setGrid((currentGrid) => moveSpecialNode(currentGrid, targetNode, { row, col }, 'isTarget'));
      setTargetNode({ row, col });
      return;
    }

    if (node.isStart || node.isTarget) {
      return;
    }

    setGrid((currentGrid) =>
      updateWall(resetSearchState(currentGrid), row, col, dragMode === 'draw-wall'),
    );
  }

  async function animateSearch(visitedOrder, path, runId) {
    const visitDelay = Math.max(4, Math.round(VISIT_DELAY_MS / speedMultiplier));
    const pathDelay = Math.max(10, Math.round(PATH_DELAY_MS / speedMultiplier));

    for (const node of visitedOrder) {
      if (animationRunIdRef.current !== runId) {
        return false;
      }

      if (!node.isStart && !node.isTarget) {
        setGrid((currentGrid) => {
          const nextGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
          nextGrid[node.row][node.col].isVisited = true;
          return nextGrid;
        });
        await sleep(visitDelay);
      }
    }

    for (const node of path) {
      if (animationRunIdRef.current !== runId) {
        return false;
      }

      if (!node.isStart && !node.isTarget) {
        setGrid((currentGrid) => {
          const nextGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
          nextGrid[node.row][node.col].isPath = true;
          return nextGrid;
        });
        await sleep(pathDelay);
      }
    }

    return true;
  }

  async function visualizeAlgorithm() {
    if (isAnimating) {
      return;
    }

    const preparedGrid = resetSearchState(grid);
    const algorithm = algorithms[algorithmKey];
    const start = preparedGrid[startNode.row][startNode.col];
    const target = preparedGrid[targetNode.row][targetNode.col];
    const runId = animationRunIdRef.current + 1;

    animationRunIdRef.current = runId;
    setGrid(preparedGrid);
    setIsAnimating(true);
    setStatusMessage(`Running ${algorithm.label}...`);

    const { visitedOrder, path } = algorithm.run(preparedGrid, start, target);
    const completed = await animateSearch(visitedOrder, path, runId);

    if (!completed || animationRunIdRef.current !== runId) {
      return;
    }

    if (path.length > 0) {
      setRunStats((currentStats) => ({
        visitedNodes: visitedOrder.length,
        pathLength: Math.max(path.length - 1, 0),
        completedRuns: currentStats.completedRuns + 1,
        lastAlgorithm: algorithm.label,
      }));
      setStatusMessage(
        `${algorithm.label} found a path with ${Math.max(path.length - 1, 0)} steps after visiting ${
          visitedOrder.length
        } nodes.`,
      );
    } else {
      setRunStats((currentStats) => ({
        visitedNodes: visitedOrder.length,
        pathLength: 0,
        completedRuns: currentStats.completedRuns + 1,
        lastAlgorithm: algorithm.label,
      }));
      setStatusMessage(`${algorithm.label} could not reach the target node.`);
    }

    setIsAnimating(false);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Pathfinding Visualizer</p>
          <h1>Watch BFS, DFS, Dijkstra, and A* explore the grid.</h1>
          <p className="hero-copy">
            Build walls with your mouse, drag the start and target nodes, and compare how each
            algorithm searches for a route.
          </p>
        </div>
      </header>

      <section className="controls-panel">
        <div className="controls-row">
          <label className="field">
            <span>Algorithm</span>
            <select
              value={algorithmKey}
              onChange={(event) => setAlgorithmKey(event.target.value)}
              disabled={isAnimating}
            >
              {algorithmOptions.map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field field-range">
            <span>Animation Speed: {speedMultiplier.toFixed(1)}x</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speedMultiplier}
              onChange={(event) => setSpeedMultiplier(Number(event.target.value))}
              disabled={isAnimating}
            />
          </label>

          <button onClick={visualizeAlgorithm} disabled={isAnimating}>
            {isAnimating ? 'Visualizing...' : 'Visualize'}
          </button>
          <button onClick={stopVisualization} disabled={!isAnimating}>
            Stop
          </button>
          <button onClick={clearPath}>
            Clear Path
          </button>
          <button onClick={clearAllWalls}>
            Clear Walls
          </button>
          <button onClick={resetBoard}>
            Reset Board
          </button>
        </div>

        <div className="legend">
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
            <span className="legend-swatch visited" />
            Visited
          </div>
          <div className="legend-item">
            <span className="legend-swatch path" />
            Final Path
          </div>
        </div>

        <p className="status">{statusMessage}</p>

        <div className="info-grid">
          <article className="info-card">
            <p className="info-label">Algorithm Overview</p>
            <h2>{selectedAlgorithm.label}</h2>
            <p>{selectedAlgorithm.summary}</p>
            <p className="info-meta">
              Shortest path guarantee: {selectedAlgorithm.shortestPathGuarantee}
            </p>
          </article>

          <article className="info-card">
            <p className="info-label">Run Stats</p>
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
                <span className="stat-value">{runStats.completedRuns}</span>
                <span className="stat-label">Completed Runs</span>
              </div>
              <div>
                <span className="stat-value stat-value-small">{runStats.lastAlgorithm}</span>
                <span className="stat-label">Last Algorithm</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="board-panel">
        <div className="board-scroll">
          <div className="grid" role="grid" aria-label="Pathfinding grid">
            {grid.map((row) =>
              row.map((node) => {
                const classNames = [
                  'cell',
                  node.isStart ? 'cell-start' : '',
                  node.isTarget ? 'cell-target' : '',
                  node.isWall ? 'cell-wall' : '',
                  node.isVisited ? 'cell-visited' : '',
                  node.isPath ? 'cell-path' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={`${node.row}-${node.col}`}
                    className={classNames}
                    onMouseDown={() => handleCellMouseDown(node.row, node.col)}
                    onMouseEnter={() => handleCellMouseEnter(node.row, node.col)}
                    aria-label={`Row ${node.row + 1}, column ${node.col + 1}`}
                    role="gridcell"
                  />
                );
              }),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
