function getNodeKey(node) {
  return `${node.row}-${node.col}`;
}

function getNeighbors(grid, node) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => !neighbor.isWall);
}

function reconstructPath(previous, endKey, grid) {
  const path = [];
  let currentKey = endKey;

  while (currentKey) {
    const [row, col] = currentKey.split('-').map(Number);
    path.unshift(grid[row][col]);
    currentKey = previous.get(currentKey);
  }

  return path;
}

function emptyResult() {
  return { visitedOrder: [], path: [] };
}

export function bfs(grid, start, target) {
  const visitedOrder = [];
  const queue = [start];
  const seen = new Set([getNodeKey(start)]);
  const previous = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    visitedOrder.push(current);

    if (current.row === target.row && current.col === target.col) {
      return {
        visitedOrder,
        path: reconstructPath(previous, getNodeKey(current), grid),
      };
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const neighborKey = getNodeKey(neighbor);

      if (seen.has(neighborKey)) {
        continue;
      }

      seen.add(neighborKey);
      previous.set(neighborKey, getNodeKey(current));
      queue.push(neighbor);
    }
  }

  return emptyResult();
}

export function dfs(grid, start, target) {
  const visitedOrder = [];
  const stack = [start];
  const seen = new Set();
  const previous = new Map();

  while (stack.length > 0) {
    const current = stack.pop();
    const currentKey = getNodeKey(current);

    if (seen.has(currentKey)) {
      continue;
    }

    seen.add(currentKey);
    visitedOrder.push(current);

    if (current.row === target.row && current.col === target.col) {
      return {
        visitedOrder,
        path: reconstructPath(previous, currentKey, grid),
      };
    }

    const neighbors = getNeighbors(grid, current).reverse();

    for (const neighbor of neighbors) {
      const neighborKey = getNodeKey(neighbor);

      if (seen.has(neighborKey)) {
        continue;
      }

      if (!previous.has(neighborKey)) {
        previous.set(neighborKey, currentKey);
      }

      stack.push(neighbor);
    }
  }

  return emptyResult();
}

export function dijkstra(grid, start, target) {
  const visitedOrder = [];
  const distances = new Map();
  const previous = new Map();
  const unvisited = [];
  const seen = new Set();

  for (const row of grid) {
    for (const node of row) {
      const key = getNodeKey(node);
      distances.set(key, Number.POSITIVE_INFINITY);
      unvisited.push(node);
    }
  }

  distances.set(getNodeKey(start), 0);

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => distances.get(getNodeKey(a)) - distances.get(getNodeKey(b)));
    const current = unvisited.shift();
    const currentKey = getNodeKey(current);

    if (current.isWall) {
      continue;
    }

    if (distances.get(currentKey) === Number.POSITIVE_INFINITY) {
      break;
    }

    if (seen.has(currentKey)) {
      continue;
    }

    seen.add(currentKey);
    visitedOrder.push(current);

    if (current.row === target.row && current.col === target.col) {
      return {
        visitedOrder,
        path: reconstructPath(previous, currentKey, grid),
      };
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const neighborKey = getNodeKey(neighbor);
      const nextDistance = distances.get(currentKey) + 1;

      if (nextDistance < distances.get(neighborKey)) {
        distances.set(neighborKey, nextDistance);
        previous.set(neighborKey, currentKey);
      }
    }
  }

  return emptyResult();
}

function manhattanDistance(node, target) {
  return Math.abs(node.row - target.row) + Math.abs(node.col - target.col);
}

export function aStar(grid, start, target) {
  const visitedOrder = [];
  const openSet = [start];
  const openKeys = new Set([getNodeKey(start)]);
  const previous = new Map();
  const gScore = new Map();
  const fScore = new Map();
  const closed = new Set();

  for (const row of grid) {
    for (const node of row) {
      const key = getNodeKey(node);
      gScore.set(key, Number.POSITIVE_INFINITY);
      fScore.set(key, Number.POSITIVE_INFINITY);
    }
  }

  gScore.set(getNodeKey(start), 0);
  fScore.set(getNodeKey(start), manhattanDistance(start, target));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(getNodeKey(a)) - fScore.get(getNodeKey(b)));
    const current = openSet.shift();
    const currentKey = getNodeKey(current);

    openKeys.delete(currentKey);

    if (closed.has(currentKey)) {
      continue;
    }

    closed.add(currentKey);
    visitedOrder.push(current);

    if (current.row === target.row && current.col === target.col) {
      return {
        visitedOrder,
        path: reconstructPath(previous, currentKey, grid),
      };
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const neighborKey = getNodeKey(neighbor);

      if (closed.has(neighborKey)) {
        continue;
      }

      const tentativeGScore = gScore.get(currentKey) + 1;

      if (tentativeGScore >= gScore.get(neighborKey)) {
        continue;
      }

      previous.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(neighborKey, tentativeGScore + manhattanDistance(neighbor, target));

      if (!openKeys.has(neighborKey)) {
        openSet.push(neighbor);
        openKeys.add(neighborKey);
      }
    }
  }

  return emptyResult();
}

export const algorithms = {
  bfs: {
    label: 'Breadth-First Search',
    run: bfs,
    summary: 'Explores the grid level by level and guarantees the shortest path on an unweighted grid.',
    shortestPathGuarantee: 'Yes',
  },
  dfs: {
    label: 'Depth-First Search',
    run: dfs,
    summary: 'Follows one branch as far as it can before backtracking, which makes it fast to explore but not shortest-path optimal.',
    shortestPathGuarantee: 'No',
  },
  dijkstra: {
    label: "Dijkstra's Algorithm",
    run: dijkstra,
    summary: 'Always expands the lowest-cost frontier first and guarantees the shortest path when edge costs are non-negative.',
    shortestPathGuarantee: 'Yes',
  },
  astar: {
    label: 'A* Search',
    run: aStar,
    summary: 'Uses path cost plus a heuristic to guide the search toward the goal while still finding the shortest path on this grid.',
    shortestPathGuarantee: 'Yes',
  },
};
