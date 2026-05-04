export const GRID_ROWS = 20;
export const GRID_COLS = 40;
export const WEIGHTED_NODE_COST = 5;

export const DEFAULT_START = { row: 10, col: 8 };
export const DEFAULT_TARGET = { row: 10, col: 31 };

export function createNode(row, col, start, target) {
  return {
    row,
    col,
    isStart: row === start.row && col === start.col,
    isTarget: row === target.row && col === target.col,
    isWall: false,
    isWeighted: false,
    weight: 1,
    isVisited: false,
    isPath: false,
  };
}

export function createGrid(start = DEFAULT_START, target = DEFAULT_TARGET) {
  return Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from({ length: GRID_COLS }, (_, col) => createNode(row, col, start, target)),
  );
}

function isValidPosition(position) {
  return (
    position &&
    Number.isInteger(position.row) &&
    Number.isInteger(position.col) &&
    position.row >= 0 &&
    position.row < GRID_ROWS &&
    position.col >= 0 &&
    position.col < GRID_COLS
  );
}

function assertValidPosition(position, label) {
  if (!isValidPosition(position)) {
    throw new Error(`${label} must be inside the ${GRID_ROWS}x${GRID_COLS} grid.`);
  }
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map((node) => ({ ...node })));
}

export function resetSearchState(grid) {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isVisited: false,
      isPath: false,
    })),
  );
}

export function clearWalls(grid, start, target) {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isStart: node.row === start.row && node.col === start.col,
      isTarget: node.row === target.row && node.col === target.col,
      isWall: false,
      isVisited: false,
      isPath: false,
    })),
  );
}

export function clearWeights(grid, start, target) {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isStart: node.row === start.row && node.col === start.col,
      isTarget: node.row === target.row && node.col === target.col,
      isWeighted: false,
      weight: 1,
      isVisited: false,
      isPath: false,
    })),
  );
}

export function moveSpecialNode(grid, previous, next, key) {
  const nextGrid = resetSearchState(cloneGrid(grid));

  nextGrid[previous.row][previous.col][key] = false;

  const nextNode = nextGrid[next.row][next.col];
  nextNode.isWall = false;
  nextNode.isWeighted = false;
  nextNode.weight = 1;
  nextNode[key] = true;

  return nextGrid;
}

export function updateNodeType(grid, row, col, nextType) {
  const nextGrid = cloneGrid(grid);
  const node = nextGrid[row][col];

  if (node.isStart || node.isTarget) {
    return nextGrid;
  }

  node.isWall = nextType === 'wall';
  node.isWeighted = nextType === 'weight';
  node.weight = nextType === 'weight' ? WEIGHTED_NODE_COST : 1;
  node.isVisited = false;
  node.isPath = false;
  return nextGrid;
}

export function generateMaze(grid, start, target) {
  return grid.map((row) =>
    row.map((node) => {
      const isSpecial =
        (node.row === start.row && node.col === start.col) ||
        (node.row === target.row && node.col === target.col);

      if (isSpecial) {
        return {
          ...node,
          isStart: node.row === start.row && node.col === start.col,
          isTarget: node.row === target.row && node.col === target.col,
          isWall: false,
          isWeighted: false,
          weight: 1,
          isVisited: false,
          isPath: false,
        };
      }

      const isBorder = node.row === 0 || node.col === 0 || node.row === grid.length - 1 || node.col === grid[0].length - 1;
      const randomValue = Math.random();
      const shouldBeWall = isBorder ? randomValue < 0.1 : randomValue < 0.24;
      const shouldBeWeight = !shouldBeWall && randomValue > 0.8;

      return {
        ...node,
        isWall: shouldBeWall,
        isWeighted: shouldBeWeight,
        weight: shouldBeWeight ? WEIGHTED_NODE_COST : 1,
        isVisited: false,
        isPath: false,
      };
    }),
  );
}

export function exportBoardState(grid, start, target, settings = {}) {
  assertValidPosition(start, 'Start position');
  assertValidPosition(target, 'Target position');

  const walls = [];
  const weights = [];

  for (const row of grid) {
    for (const node of row) {
      if (node.isWall) {
        walls.push({ row: node.row, col: node.col });
      } else if (node.isWeighted) {
        weights.push({ row: node.row, col: node.col, weight: node.weight || WEIGHTED_NODE_COST });
      }
    }
  }

  return {
    version: 1,
    rows: GRID_ROWS,
    cols: GRID_COLS,
    start,
    target,
    walls,
    weights,
    settings,
  };
}

export function serializeBoardState(grid, start, target, settings = {}) {
  return JSON.stringify(exportBoardState(grid, start, target, settings), null, 2);
}

export function importBoardState(boardState) {
  const parsedState = typeof boardState === 'string' ? JSON.parse(boardState) : boardState;

  if (!parsedState || typeof parsedState !== 'object') {
    throw new Error('Board data must be a JSON object.');
  }

  if (parsedState.rows !== GRID_ROWS || parsedState.cols !== GRID_COLS) {
    throw new Error(`Board data must match the ${GRID_ROWS}x${GRID_COLS} grid size.`);
  }

  assertValidPosition(parsedState.start, 'Start position');
  assertValidPosition(parsedState.target, 'Target position');

  if (parsedState.start.row === parsedState.target.row && parsedState.start.col === parsedState.target.col) {
    throw new Error('Start and target positions must be different.');
  }

  const grid = createGrid(parsedState.start, parsedState.target);
  const walls = Array.isArray(parsedState.walls) ? parsedState.walls : [];
  const weights = Array.isArray(parsedState.weights) ? parsedState.weights : [];

  for (const wall of walls) {
    assertValidPosition(wall, 'Wall node');

    if (
      (wall.row === parsedState.start.row && wall.col === parsedState.start.col) ||
      (wall.row === parsedState.target.row && wall.col === parsedState.target.col)
    ) {
      continue;
    }

    grid[wall.row][wall.col].isWall = true;
  }

  for (const weightNode of weights) {
    assertValidPosition(weightNode, 'Weighted node');

    if (
      (weightNode.row === parsedState.start.row && weightNode.col === parsedState.start.col) ||
      (weightNode.row === parsedState.target.row && weightNode.col === parsedState.target.col)
    ) {
      continue;
    }

    const nextNode = grid[weightNode.row][weightNode.col];

    if (nextNode.isWall) {
      continue;
    }

    nextNode.isWeighted = true;
    nextNode.weight =
      Number.isFinite(weightNode.weight) && weightNode.weight > 1
        ? weightNode.weight
        : WEIGHTED_NODE_COST;
  }

  return {
    grid,
    start: parsedState.start,
    target: parsedState.target,
    settings: parsedState.settings && typeof parsedState.settings === 'object' ? parsedState.settings : {},
  };
}
