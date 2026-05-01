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
  node.weight = nextType === 'weight' ? 5 : 1;
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
        weight: shouldBeWeight ? 5 : 1,
        isVisited: false,
        isPath: false,
      };
    }),
  );
}
