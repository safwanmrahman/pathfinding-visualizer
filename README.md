# Pathfinding Visualizer

Interactive visualizer for BFS, DFS, Dijkstra, and A* pathfinding algorithms.

## Features

- React + Vite app written in plain JavaScript
- Grid rendered with regular DOM elements, not canvas
- Click and drag to draw or erase walls
- Drag the start and target nodes to test different layouts
- Animated traversal and final path rendering
- Pure JavaScript implementations of BFS, DFS, Dijkstra, and A*

## Getting Started

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Demo

![Pathfinding Visualizer demo preview](./assets/pathfinding-visualizer-demo.png)

- Live demo: coming soon
- Local demo: run `npm run dev`

## Project Structure

```text
pathfinding-visualizer/
├── assets/
│   └── pathfinding-visualizer-demo.png
├── src/
│   ├── algorithms.js
│   ├── App.jsx
│   ├── grid.js
│   ├── main.jsx
│   └── styles.css
├── .gitignore
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

## Controls

- Choose an algorithm from the dropdown
- Click `Visualize` to animate the search
- Click and drag on the grid to place or remove walls
- Drag the green start node or red target node to move them
- Use `Clear Path`, `Clear Walls`, or `Reset Board` as needed

## Notes

- The implementation focuses on correctness and readability over optimization
- Dijkstra and A* currently use uniform movement cost on the grid
- The app is ready for deployment on Vercel or Netlify as a standard Vite project

## Future Improvements

- Add weighted nodes
- Add maze generation
- Add speed controls
- Add diagonal movement as an optional setting
- Add step-by-step execution controls
- Improve mobile responsiveness for smaller screens
- Add algorithm descriptions and complexity details in the UI
- Add unit tests for grid utilities and pathfinding algorithms
