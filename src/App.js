import React, { useState } from 'react';
import PathfindingVisualizer from './components/PathfindingVisualizer';
import ComparisonMode from './components/ComparisonMode';
import './App.css';

function App() {
  const [tab, setTab] = useState('visualizer');

  return (
    <div className="app">
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'visualizer' ? 'tab-active' : ''}`}
          onClick={() => setTab('visualizer')}
        >
          Visualizer
        </button>
        <button
          className={`tab-btn ${tab === 'compare' ? 'tab-active' : ''}`}
          onClick={() => setTab('compare')}
        >
          ⚡ Compare Algorithms
        </button>
      </div>
      {tab === 'visualizer' ? <PathfindingVisualizer /> : <ComparisonMode />}
    </div>
  );
}

export default App;