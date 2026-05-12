# Pathfinding Visualizer

An interactive pathfinding sandbox for comparing how BFS, DFS, Dijkstra, and A* behave on the same grid. You can draw walls, add weighted terrain, drag the start and target nodes, generate mazes, and watch each algorithm explore step by step.

## Demo

- Live demo: coming soon
- Local demo: run `npm run dev`
- Demo placeholder: add a short GIF or hosted recording showing wall drawing, weighted nodes, and one full algorithm run

## Tech Stack

| Area | Details |
| --- | --- |
| Frontend framework | React 18 |
| Language | JavaScript (ES modules, JSX) |
| Build tool | Vite |
| Testing | Node test runner via `node --test` |
| Styling approach | Handwritten CSS with CSS custom properties and responsive layout rules |
| Rendering approach | DOM-based grid using React components, not canvas |
| Algorithms | BFS, DFS, Dijkstra, and A* |
| Grid data model | 20x40 matrix of node objects with start, target, wall, weight, visited, and path flags |
| Maze/data utilities | Grid creation, maze generation, node editing, import/export serialization, and board validation helpers |

## Features

- Draw and erase walls directly on the grid
- Place weighted nodes to simulate slower terrain
- Drag the start and target nodes to test new routes quickly
- Toggle diagonal movement with corner cutting disabled
- Switch between automatic playback and step-by-step inspection
- Generate random, recursive division, or zigzag maze patterns
- Export the current board as JSON and import it later
- Track visited nodes, path length, path cost, and completed runs
- Review algorithm complexity and shortest-path guarantees in the UI

## How It Works

The board is a `20 x 40` grid of node objects. Every node stores its row and column along with flags that describe whether it is the start node, target node, a wall, a weighted cell, part of the visited search frontier, or part of the final path.

- Start node: the algorithm begins here.
- Target node: the algorithm tries to reach this cell.
- Walls: blocked cells that cannot be crossed by any algorithm.
- Weighted nodes: traversable cells with a movement cost of `5`.
- Normal nodes: open cells with a movement cost of `1`.

Animation flow:

1. The current board is copied into a clean search state.
2. The selected algorithm returns a `visitedOrder` list and a reconstructed `path`.
3. Those results are converted into animation frames.
4. Frames are either played automatically or advanced manually with `Step Forward`.
5. The UI reports visited count, path length, total path cost, and whether a path was found.

## Algorithms Implemented

### Breadth-First Search (BFS)

Explores outward level by level from the start node.

- Best for: unweighted grids when you want the shortest path in number of steps.
- Strength: guarantees the shortest path when every move has equal cost.
- Limitation: does not account for weighted nodes, so it treats them like normal cells.

### Depth-First Search (DFS)

Pushes down one branch as far as possible before backtracking.

- Best for: showing traversal behavior or quickly exploring a space without needing the optimal route.
- Strength: simple and useful for illustrating how search order affects results.
- Limitation: does not guarantee the shortest path and ignores weighted cost.

### Dijkstra's Algorithm

Always expands the lowest known total path cost first.

- Best for: weighted grids where path cost matters more than raw step count.
- Strength: guarantees the lowest-cost path when all edge weights are non-negative.
- Limitation: usually visits more nodes than A* because it has no goal-directed heuristic.

### A* Search

Combines Dijkstra-style path cost with a heuristic that estimates distance to the goal.

- Best for: weighted pathfinding when you want optimal paths with more goal-directed exploration.
- Strength: guarantees the shortest path in this project’s grid model while usually exploring fewer nodes than Dijkstra.
- Limitation: still depends on the quality of the heuristic and can be more complex to reason about than BFS or DFS.

## Interaction Model

- `Wall Nodes`: paint obstacles that block all traversal.
- `Weighted Nodes`: add expensive terrain that only affects Dijkstra and A*.
- `Eraser`: remove walls or weights.
- `Allow diagonal movement`: switches between 4-direction and 8-direction traversal.
- `Prepare Steps`: builds the full run without autoplay so you can inspect each frame.
- `Generate Maze`: creates a new challenge layout with one of the built-in patterns.

## Project Structure

```text
src/
├── App.jsx
├── algorithms.js
├── components/
│   ├── AlgorithmSelector.jsx
│   ├── ControlsPanel.jsx
│   ├── GridBoard.jsx
│   ├── ImportExportPanel.jsx
│   ├── Legend.jsx
│   ├── NodeCell.jsx
│   └── StatsPanel.jsx
├── constants.js
├── grid.js
├── hooks/
│   ├── useGridInteraction.js
│   └── useVisualization.js
├── utils/
│   ├── boardSettings.js
│   └── runSummary.js
├── *.test.js
└── styles.css
```

## Safety and Validation Notes

- No secrets or environment credentials are stored in the repo.
- Imported board JSON is parsed defensively and validated for version, size, node positions, and shape before being applied.
- Invalid JSON import attempts fail with user-facing error messages instead of mutating app state.
- The app uses standard React rendering with no unsafe HTML injection.

## Getting Started

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Available Scripts

```bash
npm run dev
npm test
npm run build
npm run preview
```

## Testing

The project includes unit tests for:

- pathfinding behavior
- diagonal movement rules
- weighted path selection
- grid editing helpers
- board import/export validation

CI also runs `npm test` and `npm run build` on pushes and pull requests.

## Portfolio Notes

This project is designed to show:

- algorithm visualization in a custom interactive UI
- state-heavy React component design without external state libraries
- correctness-minded pathfinding logic and test coverage
- practical attention to import validation, UI feedback, and maintainable refactoring
