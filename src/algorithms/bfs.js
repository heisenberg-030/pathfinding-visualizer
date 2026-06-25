export function bfs(grid, startNode, endNode) {
  const visited = [];
  startNode.isVisited = true;
  const queue = [startNode];

  while (queue.length) {
    const cur = queue.shift();
    if (cur.isWall) continue;
    visited.push(cur);
    if (cur === endNode) return visited;

    for (const nb of getNeighbors(cur, grid)) {
      nb.isVisited = true;
      nb.previousNode = cur;
      queue.push(nb);
    }
  }
  return visited;
}

function getNeighbors(node, grid) {
  const { row, col } = node;
  const nb = [];
  if (row > 0) nb.push(grid[row - 1][col]);
  if (row < grid.length - 1) nb.push(grid[row + 1][col]);
  if (col > 0) nb.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) nb.push(grid[row][col + 1]);
  return nb.filter(n => !n.isVisited && !n.isWall);
}

export function getNodesInShortestPath(endNode) {
  const path = [];
  let cur = endNode;
  while (cur) { path.unshift(cur); cur = cur.previousNode; }
  return path;
}