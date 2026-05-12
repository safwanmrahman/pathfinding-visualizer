export const VISIT_DELAY_MS = 12;
export const PATH_DELAY_MS = 35;

export const DEFAULT_STATS = {
  visitedNodes: 0,
  pathLength: 0,
  pathCost: 0,
  completedRuns: 0,
  lastAlgorithm: 'None yet',
};

export const INITIAL_STATUS_MESSAGE =
  'Draw walls or weighted nodes, drag the start and target nodes, then visualize an algorithm.';

export const DRAW_TOOLS = {
  wall: {
    label: 'Wall Nodes',
    helperText: 'Create blocked cells that no algorithm can pass through.',
  },
  weight: {
    label: 'Weighted Nodes',
    helperText: 'Mark slower terrain that only Dijkstra and A* will prefer to avoid.',
  },
  erase: {
    label: 'Eraser',
    helperText: 'Remove walls or weighted cells while keeping the start and target nodes intact.',
  },
};

export const PLAYBACK_MODES = {
  auto: 'Auto Play',
  step: 'Step-by-Step',
};
