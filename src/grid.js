export const GRID_ROWS = 20;
export const GRID_COLS = 40;

export const DEFAULT_START = { row: 10, col: 8 };
export const DEFAULT_TARGET = { row: 10, col: 31 };

export function createNode(row, col, start, target) {
  return {
    row,
    col,
    isStart: row === start.row && col === start.col,
    isTarget: row === target.row && col === target.col,
    isWall: false,
    isVisited: false,
    isPath: false,
  };
}

export function createGrid(start = DEFAULT_START, target = DEFAULT_TARGET) {
  return Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from({ length: GRID_COLS }, (_, col) => createNode(row, col, start, target)),
  );
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

export function moveSpecialNode(grid, previous, next, key) {
  const nextGrid = resetSearchState(cloneGrid(grid));

  nextGrid[previous.row][previous.col][key] = false;

  const nextNode = nextGrid[next.row][next.col];
  nextNode.isWall = false;
  nextNode[key] = true;

  return nextGrid;
}

export function updateWall(grid, row, col, isWall) {
  const nextGrid = cloneGrid(grid);
  const node = nextGrid[row][col];

  if (node.isStart || node.isTarget) {
    return nextGrid;
  }

  node.isWall = isWall;
  node.isVisited = false;
  node.isPath = false;
  return nextGrid;
}
