export function createFrames(visitedOrder, path) {
  const visitedFrames = visitedOrder
    .filter((node) => !node.isStart && !node.isTarget)
    .map((node) => ({ row: node.row, col: node.col, type: 'visit' }));

  const pathFrames = path
    .filter((node) => !node.isStart && !node.isTarget)
    .map((node) => ({ row: node.row, col: node.col, type: 'path' }));

  return [...visitedFrames, ...pathFrames];
}

export function calculatePathCost(path) {
  if (path.length === 0) {
    return 0;
  }

  return path.reduce((total, node) => total + (node.weight || 1), 0) - 1;
}

export function createRunSummary(algorithmLabel, visitedOrder, path) {
  return {
    algorithmLabel,
    visitedNodes: visitedOrder.length,
    pathLength: Math.max(path.length - 1, 0),
    pathCost: calculatePathCost(path),
    pathFound: path.length > 0,
  };
}
