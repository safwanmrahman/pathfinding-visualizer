# Pathfinding Visualizer

An interactive pathfinding sandbox for comparing how BFS, DFS, Dijkstra, and A* behave on the same grid. You can draw walls, add weighted terrain, drag the start and target nodes, generate mazes, and watch each algorithm explore step by step.

## Live Demo

[**Try the Pathfinding Visualizer**](https://pathfinding-visualizer-lovat.vercel.app/)

Explore the deployed app to compare algorithms, build test cases, and review the UI experience without running the project locally.

## Local Demo

- Local demo: run `npm run dev`
- Production build output: `dist/`

## Tech Stack

| Area | Details |
| --- | --- |
| Frontend framework | React 18 |
| Language | JavaScript (ES modules, JSX) |
| Build tool | Vite |
| Testing | Node test runner via `node --test` |
| Styling approach | Handwritten CSS with CSS custom properties and responsive layout rules |
| Rendering approach | DOM-based grid using React components, not canvas |
| Deployment shape | Static frontend with relative asset paths for root or subpath hosting |
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
- Drawback: does not account for weighted nodes, so it treats them like normal cells.

### Depth-First Search (DFS)

Pushes down one branch as far as possible before backtracking.

- Best for: showing traversal behavior or quickly exploring a space without needing the optimal route.
- Strength: simple and useful for illustrating how search order affects results.
- Drawback: does not guarantee the shortest path and ignores weighted cost.

### Dijkstra's Algorithm

Always expands the lowest known total path cost first.

- Best for: weighted grids where path cost matters more than raw step count.
- Strength: guarantees the lowest-cost path when all edge weights are non-negative.
- Drawback: usually visits more nodes than A* because it has no goal-directed heuristic.

### A* Search

Combines Dijkstra-style path cost with a heuristic that estimates distance to the goal.

- Best for: weighted pathfinding when you want optimal paths with more goal-directed exploration.
- Strength: guarantees the shortest path in this project’s grid model while usually exploring fewer nodes than Dijkstra.
- Drawback: still depends on the quality of the heuristic and can be more complex to reason about than BFS or DFS.

## Interaction Model

- `Wall Nodes`: paint obstacles that block all traversal.
- `Weighted Nodes`: add expensive terrain that only affects Dijkstra and A*.
- `Eraser`: remove walls or weights.
- `Allow diagonal movement`: switches between 4-direction and 8-direction traversal.
- `Prepare Steps`: builds the full run without autoplay so you can inspect each frame.
- `Generate Maze`: creates a new challenge layout with one of the built-in patterns.

## Project Structure

```text
public/
├── favicon.svg
└── site.webmanifest
src/
├── App.jsx
├── algorithms.js
├── algorithms.test.js
├── components/
│   ├── AlgorithmSelector.jsx
│   ├── AppHeader.jsx
│   ├── ControlsPanel.jsx
│   ├── GridBoard.jsx
│   ├── ImportExportPanel.jsx
│   ├── LearningPanel.jsx
│   ├── Legend.jsx
│   ├── LegendPanel.jsx
│   ├── NodeCell.jsx
│   ├── StatsPanel.jsx
│   ├── StatusPanel.jsx
│   └── UtilitySidebar.jsx
├── constants.js
├── grid.js
├── grid.test.js
├── hooks/
│   ├── useBoardZoom.js
│   ├── useGridInteraction.js
│   └── useVisualization.js
├── main.jsx
├── styles.css
└── utils/
    ├── boardSettings.js
    └── runSummary.js
```

## Safety and Validation Notes

- No secrets or environment credentials are stored in the repo.
- No environment variables are required for local or production builds.
- Imported board JSON is parsed defensively and validated for version, size, node positions, and shape before being applied.
- Invalid JSON import attempts fail with user-facing error messages instead of mutating app state.
- The app uses standard React rendering with no unsafe HTML injection.
- The app does not use client-side routing, so deployment does not require SPA rewrite rules for deep links.

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

There is currently no dedicated lint script configured in `package.json`.

## Testing

The project includes unit tests for:

- pathfinding behavior
- diagonal movement rules
- weighted path selection
- grid editing helpers
- board import/export validation

CI also runs `npm test` and `npm run build` on pushes and pull requests.

## Production Readiness Notes

- Vite is configured with a relative `base` path in [vite.config.js](/Users/safwanrahman/Downloads/Projects/pathfinding-visualizer/vite.config.js), so built assets load correctly from root domains and subpaths such as GitHub Pages repositories.
- `index.html` and `public/site.webmanifest` use relative asset references, which avoids broken favicon and manifest URLs in subpath deployments.
- The grid uses pointer events instead of mouse-only events, so drawing and dragging work on touch devices as well as desktop.
- Auto-play batches large visit animations into fewer React updates to keep the UI responsive during heavier runs without changing algorithm results.

## Deployment

The app is a static Vite build. Any host that can serve the `dist/` folder will work.

### Vercel

1. Import the repository into Vercel.
2. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy. No environment variables are needed.

### Netlify

1. Create a new site from the repository.
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy. No redirect file is required because the app does not use client-side routes.

### GitHub Pages

1. Build the app with `npm run build`.
2. Publish the contents of `dist/` to your Pages branch or Pages artifact.
3. Because the Vite base path is relative, the built app works both at `https://<user>.github.io/<repo>/` and when opened from other subpaths.

### Local production preview

```bash
npm run build
npm run preview
```
