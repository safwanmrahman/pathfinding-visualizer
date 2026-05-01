import { useEffect, useMemo, useRef, useState } from 'react';
import { algorithms } from './algorithms';
import {
  DEFAULT_START,
  DEFAULT_TARGET,
  clearWalls,
  clearWeights,
  createGrid,
  generateMaze,
  moveSpecialNode,
  resetSearchState,
  updateNodeType,
} from './grid';

const VISIT_DELAY_MS = 12;
const PATH_DELAY_MS = 35;
const DEFAULT_STATS = {
  visitedNodes: 0,
  pathLength: 0,
  pathCost: 0,
  completedRuns: 0,
  lastAlgorithm: 'None yet',
};

function createFrames(visitedOrder, path) {
  const visitedFrames = visitedOrder
    .filter((node) => !node.isStart && !node.isTarget)
    .map((node) => ({ row: node.row, col: node.col, type: 'visit' }));

  const pathFrames = path
    .filter((node) => !node.isStart && !node.isTarget)
    .map((node) => ({ row: node.row, col: node.col, type: 'path' }));

  return [...visitedFrames, ...pathFrames];
}

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
  const [selectedTool, setSelectedTool] = useState('wall');
  const [playbackMode, setPlaybackMode] = useState('auto');
  const [allowDiagonal, setAllowDiagonal] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [preparedRun, setPreparedRun] = useState(null);
  const [runStats, setRunStats] = useState(DEFAULT_STATS);
  const [statusMessage, setStatusMessage] = useState(
    'Draw walls or weighted nodes, drag the start/target nodes, then visualize an algorithm.',
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
    setPreparedRun(null);
    setGrid((currentGrid) => resetSearchState(currentGrid));
    setStatusMessage('Cleared the previous search path.');
  }

  function resetBoard() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setPreparedRun(null);
    setGrid(createGrid(DEFAULT_START, DEFAULT_TARGET));
    setStartNode(DEFAULT_START);
    setTargetNode(DEFAULT_TARGET);
    setRunStats(DEFAULT_STATS);
    setStatusMessage('Board reset to the default layout.');
  }

  function clearAllWalls() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setPreparedRun(null);
    setGrid((currentGrid) => clearWalls(currentGrid, startNode, targetNode));
    setStatusMessage('Removed all walls from the grid.');
  }

  function clearAllWeights() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setPreparedRun(null);
    setGrid((currentGrid) => clearWeights(currentGrid, startNode, targetNode));
    setStatusMessage('Removed all weighted nodes from the grid.');
  }

  function createMaze() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setPreparedRun(null);
    setGrid((currentGrid) => generateMaze(currentGrid, startNode, targetNode));
    setStatusMessage('Generated a random maze with a few weighted nodes.');
  }

  function stopVisualization() {
    animationRunIdRef.current += 1;
    setIsAnimating(false);
    setPreparedRun(null);
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

    const nextType =
      selectedTool === 'erase'
        ? 'empty'
        : selectedTool === 'weight'
          ? node.isWeighted
            ? 'empty'
            : 'weight'
          : node.isWall
            ? 'empty'
            : 'wall';

    setDragMode(nextType);
    setGrid((currentGrid) => updateNodeType(resetSearchState(currentGrid), row, col, nextType));
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
      updateNodeType(resetSearchState(currentGrid), row, col, dragMode),
    );
  }

  function applyFrame(frame) {
    setGrid((currentGrid) => {
      const nextGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
      const nextNode = nextGrid[frame.row][frame.col];

      if (frame.type === 'visit') {
        nextNode.isVisited = true;
      }

      if (frame.type === 'path') {
        nextNode.isPath = true;
      }

      return nextGrid;
    });
  }

  function finalizeRun(summary) {
    setRunStats((currentStats) => ({
      visitedNodes: summary.visitedNodes,
      pathLength: summary.pathLength,
      pathCost: summary.pathCost,
      completedRuns: currentStats.completedRuns + 1,
      lastAlgorithm: summary.algorithmLabel,
    }));

    if (summary.pathFound) {
      setStatusMessage(
        `${summary.algorithmLabel} found a path with ${summary.pathLength} steps and cost ${summary.pathCost} after visiting ${summary.visitedNodes} nodes.`,
      );
    } else {
      setStatusMessage(`${summary.algorithmLabel} could not reach the target node.`);
    }
  }

  async function animateSearch(frames, runId) {
    const visitDelay = Math.max(4, Math.round(VISIT_DELAY_MS / speedMultiplier));
    const pathDelay = Math.max(10, Math.round(PATH_DELAY_MS / speedMultiplier));

    for (const frame of frames) {
      if (animationRunIdRef.current !== runId) {
        return false;
      }

      applyFrame(frame);
      await sleep(frame.type === 'visit' ? visitDelay : pathDelay);
    }

    return true;
  }

  function stepForward() {
    if (!preparedRun) {
      return;
    }

    const nextFrame = preparedRun.frames[preparedRun.nextIndex];

    if (!nextFrame) {
      return;
    }

    applyFrame(nextFrame);

    const nextIndex = preparedRun.nextIndex + 1;

    if (nextIndex >= preparedRun.frames.length) {
      finalizeRun(preparedRun.summary);
      setPreparedRun(null);
      return;
    }

    setPreparedRun((currentRun) => ({
      ...currentRun,
      nextIndex,
    }));

    setStatusMessage(
      `Stepping through ${preparedRun.summary.algorithmLabel}: ${nextIndex}/${preparedRun.frames.length} frames applied.`,
    );
  }

  async function visualizeAlgorithm() {
    if (isAnimating) {
      return;
    }

    setPreparedRun(null);
    const preparedGrid = resetSearchState(grid);
    const algorithm = algorithms[algorithmKey];
    const start = preparedGrid[startNode.row][startNode.col];
    const target = preparedGrid[targetNode.row][targetNode.col];
    const runId = animationRunIdRef.current + 1;
    const traversalOptions = { allowDiagonal };

    animationRunIdRef.current = runId;
    setGrid(preparedGrid);
    setIsAnimating(true);
    setStatusMessage(
      playbackMode === 'step'
        ? `Preparing step-by-step frames for ${algorithm.label}...`
        : `Running ${algorithm.label}...`,
    );

    const { visitedOrder, path } = algorithm.run(preparedGrid, start, target, traversalOptions);
    const pathCost = path.reduce((total, node) => total + (node.weight || 1), 0) - (path.length > 0 ? 1 : 0);
    const summary = {
      algorithmLabel: algorithm.label,
      visitedNodes: visitedOrder.length,
      pathLength: Math.max(path.length - 1, 0),
      pathCost,
      pathFound: path.length > 0,
    };
    const frames = createFrames(visitedOrder, path);

    if (playbackMode === 'step') {
      setPreparedRun({
        frames,
        nextIndex: 0,
        summary,
      });
      setIsAnimating(false);
      setStatusMessage(
        frames.length > 0
          ? `Prepared ${frames.length} frames for ${algorithm.label}. Use Step Forward to walk through the run.`
          : `${algorithm.label} has no drawable frames for this board state.`,
      );

      if (frames.length === 0) {
        finalizeRun(summary);
        setPreparedRun(null);
      }

      return;
    }

    const completed = await animateSearch(frames, runId);

    if (!completed || animationRunIdRef.current !== runId) {
      return;
    }

    finalizeRun(summary);
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

          <label className="field">
            <span>Playback</span>
            <select
              value={playbackMode}
              onChange={(event) => setPlaybackMode(event.target.value)}
              disabled={isAnimating}
            >
              <option value="auto">Auto Play</option>
              <option value="step">Step-by-Step</option>
            </select>
          </label>

          <label className="field">
            <span>Draw Tool</span>
            <select
              value={selectedTool}
              onChange={(event) => setSelectedTool(event.target.value)}
              disabled={isAnimating}
            >
              <option value="wall">Wall Nodes</option>
              <option value="weight">Weighted Nodes</option>
              <option value="erase">Eraser</option>
            </select>
          </label>

          <label className="toggle-field" aria-label="Allow diagonal movement">
            <input
              type="checkbox"
              checked={allowDiagonal}
              onChange={(event) => setAllowDiagonal(event.target.checked)}
              disabled={isAnimating}
            />
            <span>Allow diagonal movement</span>
          </label>

          <button onClick={visualizeAlgorithm} disabled={isAnimating}>
            {isAnimating ? 'Visualizing...' : playbackMode === 'step' ? 'Prepare Steps' : 'Visualize'}
          </button>
          <button onClick={stepForward} disabled={isAnimating || !preparedRun}>
            Step Forward
          </button>
          <button onClick={stopVisualization} disabled={!isAnimating && !preparedRun}>
            Stop
          </button>
          <button onClick={clearPath}>
            Clear Path
          </button>
          <button onClick={clearAllWalls}>
            Clear Walls
          </button>
          <button onClick={clearAllWeights}>
            Clear Weights
          </button>
          <button onClick={createMaze} disabled={isAnimating}>
            Generate Maze
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

        <p className="status">{statusMessage}</p>

        <div className="info-grid">
          <article className="info-card">
            <p className="info-label">Algorithm Overview</p>
            <h2>{selectedAlgorithm.label}</h2>
            <p>{selectedAlgorithm.summary}</p>
            <p className="info-note">
              Weighted nodes cost 5. BFS and DFS treat them like normal open cells, while Dijkstra
              and A* factor the extra cost into route selection.
            </p>
            <p className="info-note">
              Movement mode: {allowDiagonal ? '8-directional with corner cutting disabled.' : '4-directional only.'}
            </p>
            <dl className="complexity-list info-meta">
              <div>
                <dt>Shortest path</dt>
                <dd>{selectedAlgorithm.shortestPathGuarantee}</dd>
              </div>
              <div>
                <dt>Time complexity</dt>
                <dd>{selectedAlgorithm.timeComplexity}</dd>
              </div>
              <div>
                <dt>Space complexity</dt>
                <dd>{selectedAlgorithm.spaceComplexity}</dd>
              </div>
            </dl>
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
                <span className="stat-value">{runStats.pathCost}</span>
                <span className="stat-label">Path Cost</span>
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
                  node.isWeighted ? 'cell-weight' : '',
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
