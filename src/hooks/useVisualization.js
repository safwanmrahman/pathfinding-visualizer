import { useEffect, useRef, useState } from 'react';
import { algorithms } from '../algorithms';
import { DEFAULT_STATS, PATH_DELAY_MS, VISIT_DELAY_MS } from '../constants';
import { resetSearchState } from '../grid';
import { createFrames, createRunSummary } from '../utils/runSummary';

const MAX_AUTO_ANIMATION_UPDATES = 180;

export function useVisualization({ grid, setGrid, startNode, targetNode, setStatusMessage, speedMultiplier }) {
  const animationRunIdRef = useRef(0);
  const pendingSleepsRef = useRef(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [preparedRun, setPreparedRun] = useState(null);
  const [runStats, setRunStats] = useState(DEFAULT_STATS);

  function clearPendingTimeouts() {
    for (const pendingSleep of pendingSleepsRef.current) {
      window.clearTimeout(pendingSleep.timeoutId);
      pendingSleep.resolve();
    }

    pendingSleepsRef.current.clear();
  }

  function sleep(delay) {
    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        pendingSleepsRef.current.delete(pendingSleep);
        resolve();
      }, delay);

      const pendingSleep = { timeoutId, resolve };
      pendingSleepsRef.current.add(pendingSleep);
    });
  }

  function cancelVisualization(clearPreparedRun = true) {
    animationRunIdRef.current += 1;
    clearPendingTimeouts();
    setIsAnimating(false);

    if (clearPreparedRun) {
      setPreparedRun(null);
    }
  }

  function applyFrames(frames) {
    if (frames.length === 0) {
      return;
    }

    setGrid((currentGrid) => {
      let nextGrid = currentGrid;
      const clonedRows = new Set();

      for (const frame of frames) {
        const currentRow = nextGrid[frame.row];
        const currentNode = currentRow[frame.col];

        if ((frame.type === 'visit' && currentNode.isVisited) || (frame.type === 'path' && currentNode.isPath)) {
          continue;
        }

        if (nextGrid === currentGrid) {
          nextGrid = [...currentGrid];
        }

        let nextRow = nextGrid[frame.row];

        if (!clonedRows.has(frame.row)) {
          nextRow = [...currentRow];
          nextGrid[frame.row] = nextRow;
          clonedRows.add(frame.row);
        }

        const nextNode = { ...nextRow[frame.col] };

        if (frame.type === 'visit') {
          nextNode.isVisited = true;
        }

        if (frame.type === 'path') {
          nextNode.isPath = true;
        }

        nextRow[frame.col] = nextNode;
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
      return;
    }

    setStatusMessage(
      `${summary.algorithmLabel} explored ${summary.visitedNodes} nodes but could not reach the target node.`,
    );
  }

  function getBatchSize(frameType, totalFrames) {
    if (frameType === 'path') {
      return 1;
    }

    return Math.max(1, Math.ceil(totalFrames / MAX_AUTO_ANIMATION_UPDATES));
  }

  async function animateSearch(frames, runId) {
    const visitDelay = Math.max(4, Math.round(VISIT_DELAY_MS / speedMultiplier));
    const pathDelay = Math.max(10, Math.round(PATH_DELAY_MS / speedMultiplier));
    let frameIndex = 0;

    while (frameIndex < frames.length) {
      if (animationRunIdRef.current !== runId) {
        return false;
      }

      const frameType = frames[frameIndex].type;
      const batchSize = getBatchSize(frameType, frames.length);
      const batch = [];

      while (
        frameIndex < frames.length &&
        frames[frameIndex].type === frameType &&
        batch.length < batchSize
      ) {
        batch.push(frames[frameIndex]);
        frameIndex += 1;
      }

      applyFrames(batch);
      await sleep((frameType === 'visit' ? visitDelay : pathDelay) * batch.length);
    }

    return true;
  }

  function clearPath() {
    cancelVisualization();
    setGrid((currentGrid) => resetSearchState(currentGrid));
    setStatusMessage('Cleared the previous search path.');
  }

  function stopVisualization() {
    cancelVisualization();
    setStatusMessage('Visualization stopped. You can resume with another run or edit the board.');
  }

  function stepForward() {
    if (!preparedRun) {
      return;
    }

    const nextFrame = preparedRun.frames[preparedRun.nextIndex];

    if (!nextFrame) {
      return;
    }

    applyFrames([nextFrame]);
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

  async function visualizeAlgorithm({ algorithmKey, playbackMode, allowDiagonal }) {
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

    try {
      const { visitedOrder, path } = algorithm.run(preparedGrid, start, target, traversalOptions);
      const summary = createRunSummary(algorithm.label, visitedOrder, path);
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
            : `${algorithm.label} finished immediately with no drawable frames for this board state.`,
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
    } catch {
      if (animationRunIdRef.current === runId) {
        setIsAnimating(false);
        setPreparedRun(null);
        setStatusMessage(`Unable to complete ${algorithm.label}. Please reset the board and try again.`);
      }
    }
  }

  function resetRunStats() {
    setRunStats(DEFAULT_STATS);
  }

  useEffect(() => {
    return () => {
      animationRunIdRef.current += 1;
      clearPendingTimeouts();
    };
  }, []);

  return {
    isAnimating,
    preparedRun,
    runStats,
    clearPath,
    stopVisualization,
    stepForward,
    visualizeAlgorithm,
    cancelVisualization,
    resetRunStats,
  };
}
