# Pathfinding Visualizer

An interactive web application that visualizes how graph search algorithms find the shortest path between two points on a grid.

**Live Demo:** https://pathfinding-visualizer-one-blush.vercel.app

---

## What is this?

Pathfinding algorithms are used everywhere — GPS navigation, game AI, network routing. This project makes them visual and interactive so you can actually *see* how each algorithm thinks.

## Features

- **5 algorithms** — each with different strategies and tradeoffs
- **Algorithm comparison mode** — run two algorithms side by side on the same maze and compare results
- **Custom weighted nodes** — assign movement costs (1–10) to cells; weighted algorithms will find the cheapest path, not just the shortest
- **Wall drawing** — click and drag to build obstacles
- **Maze generation** — random scatter maze or recursive division maze
- **Live stats** — nodes visited, path length, path cost, and algorithm runtime
- **Animation speed control** — fast, medium, or slow

---

## Algorithms

| Algorithm | Guarantees Shortest Path | Handles Weights | Strategy |
|-----------|------------------------|-----------------|----------|
| Dijkstra's | ✅ Yes | ✅ Yes | Explores all directions by cost |
| A* Search | ✅ Yes | ✅ Yes | Uses heuristic to aim toward goal |
| BFS | ✅ Yes (unweighted) | ❌ No | Explores layer by layer |
| DFS | ❌ No | ❌ No | Dives deep before backtracking |
| Greedy Best-First | ❌ No | ❌ No | Always moves toward goal |

### Key differences

- **Dijkstra vs A\***: Both find the shortest path, but A\* uses Manhattan distance as a heuristic to prioritize nodes closer to the goal — making it significantly faster in practice.
- **BFS vs DFS**: BFS guarantees the shortest path in an unweighted grid. DFS is faster but the path it finds is rarely optimal.
- **Greedy**: Very fast but can get fooled by obstacles — it charges toward the goal without considering total cost.

---

## Tech Stack

- **React** — UI and state management
- **JavaScript** — algorithm implementations
- **CSS Animations** — step-by-step visualization
- **Vercel** — deployment

---

## Running Locally

```bash
git clone https://github.com/heisenberg-030/pathfinding-visualizer.git
cd pathfinding-visualizer
npm install
npm start
```

Open http://localhost:3000 in your browser.

---

## How to Use

1. **Draw walls** — click or drag on the grid
2. **Add weights** — switch Draw Mode to Weight, adjust the slider, then click cells
3. **Move start/end** — drag the green or red node anywhere
4. **Generate a maze** — click Random Maze or Recursive Maze
5. **Visualize** — pick an algorithm and click Visualize
6. **Compare** — switch to the Compare tab, pick two algorithms, click Compare

---

## Project Structure

```
src/
├── algorithms/
│   ├── dijkstra.js
│   ├── astar.js
│   ├── bfs.js
│   ├── dfs.js
│   └── greedy.js
├── components/
│   ├── PathfindingVisualizer.jsx
│   ├── PathfindingVisualizer.css
│   ├── ComparisonMode.jsx
│   ├── ComparisonMode.css
│   ├── Node.jsx
│   └── Node.css
├── App.js
└── index.js
```

---

## What I Learned

- How graph search algorithms work and their real tradeoffs in speed vs optimality
- Why A\* is faster than Dijkstra (heuristic guidance reduces unnecessary exploration)
- React state management for complex interactive UIs
- CSS animations for step-by-step algorithm visualization
- Deploying React apps with Vercel and GitHub CI/CD
