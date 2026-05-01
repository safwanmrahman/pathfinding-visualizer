import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_START,
  DEFAULT_TARGET,
  clearWeights,
  createGrid,
  generateMaze,
  moveSpecialNode,
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
