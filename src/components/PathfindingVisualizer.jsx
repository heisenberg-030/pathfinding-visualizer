import React, { useState, useEffect, useCallback } from 'react';
import Node from './Node';
import { dijkstra, getNodesInShortestPath as dijkstraPath } from '../algorithms/dijkstra';
import { astar, getNodesInShortestPath as astarPath } from '../algorithms/astar';
import { bfs, getNodesInShortestPath as bfsPath } from '../algorithms/bfs';
import { dfs, getNodesInShortestPath as dfsPath } from '../algorithms/dfs';
import { greedy, getNodesInShortestPath as greedyPath } from '../algorithms/greedy';
import './PathfindingVisualizer.css';

const ROWS = 20;
const COLS = 50;
const START_ROW = 10;
const START_COL = 5;
const END_ROW = 10;
const END_COL = 44;

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

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState(buildGrid);
  const [startPos, setStartPos] = useState({ row: START_ROW, col: START_COL });
  const [endPos, setEndPos] = useState({ row: END_ROW, col: END_COL });
  const [isRunning, setIsRunning] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [drawMode, setDrawMode] = useState('wall');
  const [weightValue, setWeightValue] = useState(5);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [speed, setSpeed] = useState('medium');
  const [stats, setStats] = useState({ visited: 0, path: 0, cost: 0, time: '—' });
  const [message, setMessage] = useState('Draw walls by clicking or dragging. Drag the green/red node to move them.');

  const speedMap = { fast: 8, medium: 22, slow: 60 };

  const resetNodeState = useCallback((g) => {
    return g.map(row => row.map(node => ({
      ...node,
      isVisited: false,
      distance: Infinity,
      g: Infinity,
      f: Infinity,
      previousNode: null,
    })));
  }, []);

  const clearPathVisuals = useCallback(() => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = document.getElementById(`node-${r}-${c}`);
        if (el) {
          el.classList.remove('node-visited', 'node-path');
        }
      }
    }
  }, []);

  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    setMouseDown(true);
    if (row === startPos.row && col === startPos.col) { setDragging('start'); return; }
    if (row === endPos.row && col === endPos.col) { setDragging('end'); return; }
    const newGrid = grid.map(r => r.map(n => ({ ...n })));
    const node = newGrid[row][col];
    if (drawMode === 'weight') {
      node.weight = weightValue;
      node.isWall = false;
    } else {
      node.isWall = !node.isWall;
      node.weight = 1;
    }
    setGrid(newGrid);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseDown || isRunning) return;
    if (dragging === 'start') {
      if (row === endPos.row && col === endPos.col) return;
      setStartPos({ row, col });
      const newGrid = grid.map((r, ri) => r.map((n, ci) => ({
        ...n,
        isStart: ri === row && ci === col,
      })));
      setGrid(newGrid);
      return;
    }
    if (dragging === 'end') {
      if (row === startPos.row && col === startPos.col) return;
      setEndPos({ row, col });
      const newGrid = grid.map((r, ri) => r.map((n, ci) => ({
        ...n,
        isEnd: ri === row && ci === col,
      })));
      setGrid(newGrid);
      return;
    }
    if (row === startPos.row && col === startPos.col) return;
    if (row === endPos.row && col === endPos.col) return;
    const newGrid = grid.map(r => r.map(n => ({ ...n })));
    const node = newGrid[row][col];
    if (drawMode === 'weight') {
      node.weight = weightValue;
      node.isWall = false;
    } else {
      node.isWall = true;
      node.weight = 1;
    }
    setGrid(newGrid);
  };

  const handleMouseUp = () => { setMouseDown(false); setDragging(null); };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const runAlgorithm = (freshGrid) => {
    const s = freshGrid[startPos.row][startPos.col];
    const e = freshGrid[endPos.row][endPos.col];
    if (algorithm === 'dijkstra') return { visited: dijkstra(freshGrid, s, e), getPath: dijkstraPath };
    if (algorithm === 'astar')    return { visited: astar(freshGrid, s, e),    getPath: astarPath };
    if (algorithm === 'bfs')      return { visited: bfs(freshGrid, s, e),      getPath: bfsPath };
    if (algorithm === 'dfs')      return { visited: dfs(freshGrid, s, e),      getPath: dfsPath };
    if (algorithm === 'greedy')   return { visited: greedy(freshGrid, s, e),   getPath: greedyPath };
  };

  const visualize = () => {
    if (isRunning) return;
    clearPathVisuals();
    setStats({ visited: 0, path: 0, cost: 0, time: '—' });
    const freshGrid = resetNodeState(grid);
    setGrid(freshGrid);

    const t0 = performance.now();
    const { visited, getPath } = runAlgorithm(freshGrid);
    const t1 = performance.now();

    const endNode = freshGrid[endPos.row][endPos.col];
    const path = getPath(endNode);

    setIsRunning(true);
    const spd = speedMap[speed];

    let i = 0;
    function animateVisited() {
      if (i < visited.length) {
        const node = visited[i];
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el && !node.isStart && !node.isEnd) el.classList.add('node-visited');
        setStats(s => ({ ...s, visited: i + 1 }));
        i++;
        setTimeout(animateVisited, spd);
      } else {
        setStats(s => ({ ...s, time: (t1 - t0).toFixed(1) }));
        if (path.length < 2) {
          setMessage('No path found! The destination is blocked.');
          setIsRunning(false);
          return;
        }
        let pi = 0, cost = 0;
        function animatePath() {
          if (pi < path.length) {
            const node = path[pi];
            const el = document.getElementById(`node-${node.row}-${node.col}`);
            if (el && !node.isStart && !node.isEnd) el.classList.add('node-path');
            cost += node.weight;
            setStats(s => ({ ...s, path: pi + 1, cost }));
            pi++;
            setTimeout(animatePath, spd * 2);
          } else {
            setMessage(`Done! Path found — ${path.length} steps, cost ${cost}.`);
            setIsRunning(false);
          }
        }
        animatePath();
      }
    }
    animateVisited();
  };

  const clearPath = () => {
    if (isRunning) return;
    clearPathVisuals();
    setStats({ visited: 0, path: 0, cost: 0, time: '—' });
    setMessage('');
  };

  const clearAll = () => {
    if (isRunning) return;
    clearPathVisuals();
    setGrid(buildGrid());
    setStartPos({ row: START_ROW, col: START_COL });
    setEndPos({ row: END_ROW, col: END_COL });
    setStats({ visited: 0, path: 0, cost: 0, time: '—' });
    setMessage('Grid cleared!');
  };

  const randomMaze = () => {
    if (isRunning) return;
    clearPathVisuals();
    const newGrid = grid.map((row, r) => row.map((node, c) => ({
      ...node,
      isWall: (r !== startPos.row || c !== startPos.col) &&
              (r !== endPos.row   || c !== endPos.col) &&
              Math.random() < 0.3,
      weight: 1,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
    })));
    setGrid(newGrid);
    setMessage('Random maze generated!');
  };

  const recursiveMaze = () => {
    if (isRunning) return;
    clearPathVisuals();
    const newGrid = grid.map(row => row.map(node => ({ ...node, isWall: true, weight: 1, isVisited: false, distance: Infinity, previousNode: null })));
    function carve(r, c) {
      newGrid[r][c].isWall = false;
      const dirs = [[0,2],[0,-2],[2,0],[-2,0]].sort(() => Math.random() - 0.5);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && newGrid[nr][nc].isWall) {
          newGrid[r + dr / 2][c + dc / 2].isWall = false;
          carve(nr, nc);
        }
      }
    }
    carve(1, 1);
    newGrid[startPos.row][startPos.col].isWall = false;
    newGrid[endPos.row][endPos.col].isWall = false;
    setGrid(newGrid);
    setMessage('Recursive maze generated!');
  };

  return (
    <div className="pv-container">
      <div className="pv-header">
        <h1 className="pv-title">Pathfinding Visualizer</h1>
        <p className="pv-subtitle">Visualize how graph algorithms find the shortest path</p>
      </div>

      <div className="pv-toolbar">
        <div className="pv-control">
          <label>Algorithm</label>
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} disabled={isRunning}>
            <option value="dijkstra">Dijkstra's</option>
            <option value="astar">A* Search</option>
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="greedy">Greedy Best-First</option>
          </select>
        </div>
        <div className="pv-control">
          <label>Speed</label>
          <select value={speed} onChange={e => setSpeed(e.target.value)} disabled={isRunning}>
            <option value="fast">Fast</option>
            <option value="medium">Medium</option>
            <option value="slow">Slow</option>
          </select>
        </div>
        <div className="pv-control">
          <label>Draw Mode</label>
          <select value={drawMode} onChange={e => setDrawMode(e.target.value)} disabled={isRunning}>
            <option value="wall">Wall</option>
            <option value="weight">Weight</option>
          </select>
        </div>
        <div className={`pv-control ${drawMode !== 'weight' ? 'weight-inactive' : ''}`}>
          <label>Weight Value: {weightValue} {drawMode !== 'weight' && <span className="weight-hint">(switch Draw Mode to Weight)</span>}</label>
          <input
            type="range"
            min="2"
            max="10"
            value={weightValue}
            onChange={e => setWeightValue(Number(e.target.value))}
            disabled={isRunning || drawMode !== 'weight'}
            style={{ width: '120px', accentColor: '#1D9E75' }}
          />
        </div>
      </div>

      <div className="pv-buttons">
        <button className="btn btn-primary" onClick={visualize} disabled={isRunning}>
          ▶ Visualize {algorithm === 'dijkstra' ? "Dijkstra's" : algorithm === 'astar' ? 'A*' : algorithm.toUpperCase()}
        </button>
        <button className="btn" onClick={randomMaze} disabled={isRunning}>Random Maze</button>
        <button className="btn" onClick={recursiveMaze} disabled={isRunning}>Recursive Maze</button>
        <button className="btn" onClick={clearPath} disabled={isRunning}>Clear Path</button>
        <button className="btn" onClick={clearAll} disabled={isRunning}>Clear All</button>
      </div>

      <div className="pv-legend">
        <div className="leg"><div className="leg-box" style={{background:'#1D9E75'}}></div>Start</div>
        <div className="leg"><div className="leg-box" style={{background:'#e55a5a'}}></div>End</div>
        <div className="leg"><div className="leg-box" style={{background:'#2a3040'}}></div>Wall</div>
        <div className="leg"><div className="leg-box" style={{background:'#6b4e9c'}}></div>Weight</div>
        <div className="leg"><div className="leg-box" style={{background:'#1a3a5c'}}></div>Visited</div>
        <div className="leg"><div className="leg-box" style={{background:'#f5c842'}}></div>Path</div>
      </div>

      <div className="pv-grid-wrap">
        <div className="pv-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 22px)` }}>
          {grid.map((row, rIdx) =>
            row.map((node, cIdx) => (
              <Node
                key={`${rIdx}-${cIdx}`}
                row={rIdx} col={cIdx}
                isStart={rIdx === startPos.row && cIdx === startPos.col}
                isEnd={rIdx === endPos.row && cIdx === endPos.col}
                isWall={node.isWall}
                isWeight={node.weight > 1}
                weight={node.weight}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
              />
            ))
          )}
        </div>
      </div>

      <div className="pv-stats">
        <div className="stat-card"><div className="stat-val">{stats.visited}</div><div className="stat-lbl">Nodes visited</div></div>
        <div className="stat-card"><div className="stat-val">{stats.path}</div><div className="stat-lbl">Path length</div></div>
        <div className="stat-card"><div className="stat-val">{stats.cost}</div><div className="stat-lbl">Path cost</div></div>
        <div className="stat-card"><div className="stat-val">{stats.time}</div><div className="stat-lbl">Algo time (ms)</div></div>
      </div>

      <p className="pv-message">{message}</p>
    </div>
  );
}