import React, { useState, useCallback } from 'react';
import { dijkstra, getNodesInShortestPath as dijkstraPath } from '../algorithms/dijkstra';
import { astar, getNodesInShortestPath as astarPath } from '../algorithms/astar';
import { bfs, getNodesInShortestPath as bfsPath } from '../algorithms/bfs';
import { dfs, getNodesInShortestPath as dfsPath } from '../algorithms/dfs';
import { greedy, getNodesInShortestPath as greedyPath } from '../algorithms/greedy';
import './ComparisonMode.css';

const ROWS = 15;
const COLS = 35;
const START_ROW = 7;
const START_COL = 3;
const END_ROW = 7;
const END_COL = 31;

function createNode(row, col) {
  return {
    row, col,
    isStart: row === START_ROW && col === START_COL,
    isEnd: row === END_ROW && col === END_COL,
    isWall: false,
    isVisited: false,
    weight: 1,
    distance: Infinity,
    g: Infinity,
    f: Infinity,
    previousNode: null,
  };
}

function buildGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => createNode(r, c))
  );
}

const ALGO_MAP = {
  dijkstra: { fn: dijkstra, path: dijkstraPath, label: "Dijkstra's" },
  astar:    { fn: astar,    path: astarPath,    label: 'A* Search' },
  bfs:      { fn: bfs,      path: bfsPath,      label: 'BFS' },
  dfs:      { fn: dfs,      path: dfsPath,      label: 'DFS' },
  greedy:   { fn: greedy,   path: greedyPath,   label: 'Greedy' },
};

export default function ComparisonMode() {
  const [grid, setGrid] = useState(buildGrid);
  const [algo1, setAlgo1] = useState('dijkstra');
  const [algo2, setAlgo2] = useState('astar');
  const [isRunning, setIsRunning] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [stats1, setStats1] = useState(null);
  const [stats2, setStats2] = useState(null);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('Draw walls on the grid below, then click Compare!');

  const clearVisuals = useCallback((prefix) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = document.getElementById(`${prefix}-${r}-${c}`);
        if (el) el.className = getCellClass(r, c);
      }
    }
  }, []);

  function getCellClass(r, c) {
    if (r === START_ROW && c === START_COL) return 'cmp-cell cmp-start';
    if (r === END_ROW && c === END_COL) return 'cmp-cell cmp-end';
    return 'cmp-cell';
  }

  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    setMouseDown(true);
    const newGrid = grid.map(r => r.map(n => ({ ...n })));
    const node = newGrid[row][col];
    if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall;
      setGrid(newGrid);
      ['g1', 'g2'].forEach(prefix => {
        const el = document.getElementById(`${prefix}-${row}-${col}`);
        if (el) el.className = `cmp-cell${node.isWall ? ' cmp-wall' : ''}`;
      });
    }
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseDown || isRunning) return;
    const newGrid = grid.map(r => r.map(n => ({ ...n })));
    const node = newGrid[row][col];
    if (!node.isStart && !node.isEnd && !node.isWall) {
      node.isWall = true;
      setGrid(newGrid);
      ['g1', 'g2'].forEach(prefix => {
        const el = document.getElementById(`${prefix}-${row}-${col}`);
        if (el) el.className = 'cmp-cell cmp-wall';
      });
    }
  };

  const handleMouseUp = () => setMouseDown(false);

  const resetGridState = (g) => g.map(row => row.map(n => ({
    ...n,
    isVisited: false,
    distance: Infinity,
    g: Infinity,
    f: Infinity,
    previousNode: null,
  })));

  const runComparison = () => {
    if (isRunning || algo1 === algo2) {
      if (algo1 === algo2) setMessage('Please select two different algorithms!');
      return;
    }
    clearVisuals('g1');
    clearVisuals('g2');
    setStats1(null);
    setStats2(null);
    setWinner(null);
    setIsRunning(true);
    setMessage('Running comparison...');

    const grid1 = resetGridState(grid);
    const grid2 = resetGridState(grid);

    const s1 = grid1[START_ROW][START_COL];
    const e1 = grid1[END_ROW][END_COL];
    const s2 = grid2[START_ROW][START_COL];
    const e2 = grid2[END_ROW][END_COL];

    const t0a = performance.now();
    const visited1 = ALGO_MAP[algo1].fn(grid1, s1, e1);
    const t1a = performance.now();
    const path1 = ALGO_MAP[algo1].path(e1);

    const t0b = performance.now();
    const visited2 = ALGO_MAP[algo2].fn(grid2, s2, e2);
    const t1b = performance.now();
    const path2 = ALGO_MAP[algo2].path(e2);

    const result1 = { visited: visited1.length, path: path1.length, time: (t1a - t0a).toFixed(2) };
    const result2 = { visited: visited2.length, path: path2.length, time: (t1b - t0b).toFixed(2) };

    const spd = 12;
    const maxLen = Math.max(visited1.length, visited2.length);
    let i = 0;

    function animateBoth() {
      if (i < maxLen) {
        if (i < visited1.length) {
          const n = visited1[i];
          if (!n.isStart && !n.isEnd) {
            const el = document.getElementById(`g1-${n.row}-${n.col}`);
            if (el) el.className = 'cmp-cell cmp-visited';
          }
        }
        if (i < visited2.length) {
          const n = visited2[i];
          if (!n.isStart && !n.isEnd) {
            const el = document.getElementById(`g2-${n.row}-${n.col}`);
            if (el) el.className = 'cmp-cell cmp-visited';
          }
        }
        i++;
        setTimeout(animateBoth, spd);
      } else {
        let pi = 0;
        const maxPath = Math.max(path1.length, path2.length);
        function animatePaths() {
          if (pi < maxPath) {
            if (pi < path1.length) {
              const n = path1[pi];
              if (!n.isStart && !n.isEnd) {
                const el = document.getElementById(`g1-${n.row}-${n.col}`);
                if (el) el.className = 'cmp-cell cmp-path';
              }
            }
            if (pi < path2.length) {
              const n = path2[pi];
              if (!n.isStart && !n.isEnd) {
                const el = document.getElementById(`g2-${n.row}-${n.col}`);
                if (el) el.className = 'cmp-cell cmp-path';
              }
            }
            pi++;
            setTimeout(animatePaths, spd * 2);
          } else {
            setStats1(result1);
            setStats2(result2);
            const w = result1.visited < result2.visited ? algo1 : result2.visited < result1.visited ? algo2 : 'tie';
            setWinner(w);
            setMessage(
              w === 'tie'
                ? 'It\'s a tie! Both algorithms explored the same number of nodes.'
                : `${ALGO_MAP[w].label} wins — explored fewer nodes!`
            );
            setIsRunning(false);
          }
        }
        animatePaths();
      }
    }
    animateBoth();
  };

  const clearAll = () => {
    if (isRunning) return;
    setGrid(buildGrid());
    clearVisuals('g1');
    clearVisuals('g2');
    setStats1(null);
    setStats2(null);
    setWinner(null);
    setMessage('Grid cleared!');
  };

  const randomMaze = () => {
    if (isRunning) return;
    clearVisuals('g1');
    clearVisuals('g2');
    setStats1(null);
    setStats2(null);
    setWinner(null);
    const newGrid = grid.map((row, r) => row.map((node, c) => ({
      ...node,
      isWall: !node.isStart && !node.isEnd && Math.random() < 0.28,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
    })));
    setGrid(newGrid);
    ['g1', 'g2'].forEach(prefix => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const el = document.getElementById(`${prefix}-${r}-${c}`);
          if (el) {
            el.className = 'cmp-cell';
            if (newGrid[r][c].isWall) el.className = 'cmp-cell cmp-wall';
            if (r === START_ROW && c === START_COL) el.className = 'cmp-cell cmp-start';
            if (r === END_ROW && c === END_COL) el.className = 'cmp-cell cmp-end';
          }
        }
      }
    });
    setMessage('Random maze generated!');
  };

  function renderGrid(prefix) {
    return (
      <div
        className="cmp-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 16px)` }}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, r) => row.map((node, c) => {
          const cls = node.isStart ? 'cmp-cell cmp-start'
            : node.isEnd ? 'cmp-cell cmp-end'
            : node.isWall ? 'cmp-cell cmp-wall'
            : 'cmp-cell';
          return (
            <div
              key={`${r}-${c}`}
              id={`${prefix}-${r}-${c}`}
              className={cls}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              onMouseUp={handleMouseUp}
            />
          );
        }))}
      </div>
    );
  }

  function StatCard({ label, s1, s2, unit, lowerIsBetter = true }) {
    if (!s1 || !s2) return null;
    const v1 = parseFloat(s1);
    const v2 = parseFloat(s2);
    const w1 = lowerIsBetter ? v1 < v2 : v1 > v2;
    const w2 = lowerIsBetter ? v2 < v1 : v2 > v1;
    return (
      <div className="cmp-stat-row">
        <div className={`cmp-stat-val ${w1 ? 'cmp-winner' : w2 ? 'cmp-loser' : ''}`}>{s1}{unit}</div>
        <div className="cmp-stat-label">{label}</div>
        <div className={`cmp-stat-val ${w2 ? 'cmp-winner' : w1 ? 'cmp-loser' : ''}`}>{s2}{unit}</div>
      </div>
    );
  }

  return (
    <div className="cmp-container" onMouseUp={handleMouseUp}>
      <div className="cmp-selectors">
        <div className="cmp-algo-pick left">
          <label>Algorithm 1</label>
          <select value={algo1} onChange={e => setAlgo1(e.target.value)} disabled={isRunning}>
            <option value="dijkstra">Dijkstra's</option>
            <option value="astar">A* Search</option>
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="greedy">Greedy</option>
          </select>
        </div>
        <div className="cmp-center-btns">
          <button className="btn btn-primary" onClick={runComparison} disabled={isRunning}>
            ⚡ Compare
          </button>
          <button className="btn" onClick={randomMaze} disabled={isRunning}>Random Maze</button>
          <button className="btn" onClick={clearAll} disabled={isRunning}>Clear All</button>
        </div>
        <div className="cmp-algo-pick right">
          <label>Algorithm 2</label>
          <select value={algo2} onChange={e => setAlgo2(e.target.value)} disabled={isRunning}>
            <option value="dijkstra">Dijkstra's</option>
            <option value="astar">A* Search</option>
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="greedy">Greedy</option>
          </select>
        </div>
      </div>

      <p className="cmp-message">{message}</p>

      <div className="cmp-grids-wrap">
        <div className="cmp-grid-section">
          <div className={`cmp-grid-label ${winner === algo1 ? 'cmp-win-label' : ''}`}>
            {ALGO_MAP[algo1].label} {winner === algo1 ? '🏆' : ''}
          </div>
          <div className="cmp-grid-wrap">{renderGrid('g1')}</div>
        </div>
        <div className="cmp-grid-section">
          <div className={`cmp-grid-label ${winner === algo2 ? 'cmp-win-label' : ''}`}>
            {ALGO_MAP[algo2].label} {winner === algo2 ? '🏆' : ''}
          </div>
          <div className="cmp-grid-wrap">{renderGrid('g2')}</div>
        </div>
      </div>

      {stats1 && stats2 && (
        <div className="cmp-stats-panel">
          <div className="cmp-stats-header">
            <span>{ALGO_MAP[algo1].label}</span>
            <span>Metric</span>
            <span>{ALGO_MAP[algo2].label}</span>
          </div>
          <StatCard label="Nodes visited" s1={stats1.visited} s2={stats2.visited} unit="" />
          <StatCard label="Path length" s1={stats1.path} s2={stats2.path} unit=" steps" />
          <StatCard label="Algo time" s1={stats1.time} s2={stats2.time} unit="ms" />
        </div>
      )}
    </div>
  );
}