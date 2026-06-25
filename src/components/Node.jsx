import React from 'react';
import './Node.css';

const Node = ({
  row, col,
  isStart, isEnd, isWall, isWeight, weight,
  onMouseDown, onMouseEnter, onMouseUp,
}) => {
  const extraClass = isStart
    ? 'node-start'
    : isEnd
    ? 'node-end'
    : isWall
    ? 'node-wall'
    : '';

  const weightOpacity = isWeight ? 0.3 + (weight / 10) * 0.7 : 1;
  const weightStyle = isWeight ? { backgroundColor: `rgba(107, 78, 156, ${weightOpacity})` } : {};

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClass}`}
      style={weightStyle}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    />
  );
};

export default Node;