import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_START,
  DEFAULT_TARGET,
  WEIGHTED_NODE_COST,
  clearWeights,
  createGrid,
  exportBoardState,
  generateMaze,
  importBoardState,
  moveSpecialNode,
  serializeBoardState,
  updateNodeType,
} from './grid.js';

test('updateNodeType applies weighted nodes and clears search state', () => {
  const grid = createGrid();
  const updatedGrid = updateNodeType(grid, 5, 5, 'weight');

  assert.equal(updatedGrid[5][5].isWeighted, true);
  assert.equal(updatedGrid[5][5].weight, 5);
  assert.equal(updatedGrid[5][5].isWall, false);
  assert.equal(updatedGrid[5][5].isVisited, false);
  assert.equal(updatedGrid[5][5].isPath, false);
});

test('moveSpecialNode clears walls and weights from the destination cell', () => {
  let grid = createGrid();
  grid = updateNodeType(grid, 4, 4, 'wall');
  grid = updateNodeType(grid, 4, 5, 'weight');

  const movedStartGrid = moveSpecialNode(grid, DEFAULT_START, { row: 4, col: 5 }, 'isStart');

  assert.equal(movedStartGrid[4][5].isStart, true);
  assert.equal(movedStartGrid[4][5].isWall, false);
  assert.equal(movedStartGrid[4][5].isWeighted, false);
  assert.equal(movedStartGrid[4][5].weight, 1);
});

test('clearWeights removes all weighted nodes while preserving start and target', () => {
  let grid = createGrid();
  grid = updateNodeType(grid, 6, 6, 'weight');
  grid = updateNodeType(grid, 7, 7, 'weight');

  const clearedGrid = clearWeights(grid, DEFAULT_START, DEFAULT_TARGET);

  assert.equal(clearedGrid[6][6].isWeighted, false);
  assert.equal(clearedGrid[7][7].weight, 1);
  assert.equal(clearedGrid[DEFAULT_START.row][DEFAULT_START.col].isStart, true);
  assert.equal(clearedGrid[DEFAULT_TARGET.row][DEFAULT_TARGET.col].isTarget, true);
});

test('generateMaze keeps start and target cells open', () => {
  const grid = createGrid();
  const mazeGrid = generateMaze(grid, DEFAULT_START, DEFAULT_TARGET);

  assert.equal(mazeGrid[DEFAULT_START.row][DEFAULT_START.col].isWall, false);
  assert.equal(mazeGrid[DEFAULT_START.row][DEFAULT_START.col].isWeighted, false);
  assert.equal(mazeGrid[DEFAULT_TARGET.row][DEFAULT_TARGET.col].isWall, false);
  assert.equal(mazeGrid[DEFAULT_TARGET.row][DEFAULT_TARGET.col].isWeighted, false);
});

test('generateMaze recursive division pattern is deterministic for the same board size', () => {
  const grid = createGrid();
  const firstMaze = generateMaze(grid, DEFAULT_START, DEFAULT_TARGET, 'recursiveDivision');
  const secondMaze = generateMaze(grid, DEFAULT_START, DEFAULT_TARGET, 'recursiveDivision');

  assert.deepEqual(firstMaze, secondMaze);
  assert.equal(firstMaze[0][0].isWall, true);
  assert.equal(firstMaze[DEFAULT_START.row][DEFAULT_START.col].isWall, false);
  assert.equal(firstMaze[DEFAULT_TARGET.row][DEFAULT_TARGET.col].isWall, false);
});

test('generateMaze zigzag pattern creates repeatable wall bands and weighted corridors', () => {
  const grid = createGrid();
  const mazeGrid = generateMaze(grid, DEFAULT_START, DEFAULT_TARGET, 'zigzag');

  assert.equal(mazeGrid[2][2].isWall, true);
  assert.equal(mazeGrid[2][1].isWall, false);
  assert.equal(mazeGrid[3][4].isWeighted, true);
  assert.equal(mazeGrid[3][4].weight, WEIGHTED_NODE_COST);
  assert.equal(mazeGrid[DEFAULT_START.row][DEFAULT_START.col].isWall, false);
  assert.equal(mazeGrid[DEFAULT_TARGET.row][DEFAULT_TARGET.col].isWall, false);
});

test('serializeBoardState and importBoardState preserve walls, weights, and settings', () => {
  let grid = createGrid();
  grid = updateNodeType(grid, 3, 3, 'wall');
  grid = updateNodeType(grid, 4, 7, 'weight');

  const settings = {
    algorithmKey: 'astar',
    playbackMode: 'step',
    allowDiagonal: true,
    mazePattern: 'zigzag',
    speedMultiplier: 2,
    selectedTool: 'erase',
  };

  const serializedState = serializeBoardState(grid, DEFAULT_START, DEFAULT_TARGET, settings);
  const importedState = importBoardState(serializedState);

  assert.equal(importedState.grid[3][3].isWall, true);
  assert.equal(importedState.grid[4][7].isWeighted, true);
  assert.equal(importedState.grid[4][7].weight, WEIGHTED_NODE_COST);
  assert.deepEqual(importedState.start, DEFAULT_START);
  assert.deepEqual(importedState.target, DEFAULT_TARGET);
  assert.deepEqual(importedState.settings, settings);
});

test('importBoardState rejects board data with the wrong grid size', () => {
  const exportedState = exportBoardState(createGrid(), DEFAULT_START, DEFAULT_TARGET);
  exportedState.rows = 10;

  assert.throws(() => importBoardState(exportedState), {
    message: 'Board data must match the 20x40 grid size.',
  });
});
