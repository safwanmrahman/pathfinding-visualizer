import test from 'node:test';
import assert from 'node:assert/strict';
import { aStar, bfs, dijkstra } from './algorithms.js';

function makeNode(row, col, overrides = {}) {
  return {
    row,
    col,
    isStart: false,
    isTarget: false,
    isWall: false,
    isWeighted: false,
    weight: 1,
    isVisited: false,
    isPath: false,
    ...overrides,
  };
}

function makeGrid(rows, cols, options = {}) {
  const { start = { row: 0, col: 0 }, target = { row: rows - 1, col: cols - 1 } } = options;

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) =>
      makeNode(row, col, {
        isStart: row === start.row && col === start.col,
        isTarget: row === target.row && col === target.col,
      }),
    ),
  );
}

test('bfs uses diagonal movement when enabled', () => {
  const grid = makeGrid(2, 2, {
    start: { row: 0, col: 0 },
    target: { row: 1, col: 1 },
  });

  const withoutDiagonal = bfs(grid, grid[0][0], grid[1][1]);
  const withDiagonal = bfs(grid, grid[0][0], grid[1][1], { allowDiagonal: true });

  assert.equal(withoutDiagonal.path.length - 1, 2);
  assert.equal(withDiagonal.path.length - 1, 1);
});

test('diagonal movement does not cut through blocked corners', () => {
  const grid = makeGrid(2, 2, {
    start: { row: 0, col: 0 },
    target: { row: 1, col: 1 },
  });

  grid[0][1].isWall = true;
  grid[1][0].isWall = true;

  const result = aStar(grid, grid[0][0], grid[1][1], { allowDiagonal: true });

  assert.equal(result.path.length, 0);
});

test('dijkstra prefers a cheaper weighted route over a shorter expensive route', () => {
  const grid = makeGrid(2, 3, {
    start: { row: 0, col: 0 },
    target: { row: 0, col: 2 },
  });

  grid[0][1].isWeighted = true;
  grid[0][1].weight = 5;

  const result = dijkstra(grid, grid[0][0], grid[0][2]);
  const pathKeys = result.path.map((node) => `${node.row}-${node.col}`);

  assert.deepEqual(pathKeys, ['0-0', '1-0', '1-1', '1-2', '0-2']);
});
