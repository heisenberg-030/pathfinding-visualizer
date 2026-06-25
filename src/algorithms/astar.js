export function astar(grid, startNode, endNode) {
  const visited = [];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);
  const open = [startNode];
  const closed = new Set();

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift();
    if (cur.isWall || closed.has(cur)) continue;
    closed.add(cur);
    cur.isVisited = true;
    visited.push(cur);
    if (cur === endNode) return visited;

    for (const nb of getNeighbors(cur, grid)) {
      if (closed.has(nb) || nb.isWall) continue;
      const ng = cur.g + nb.weight;
      if (ng < nb.g) {
        nb.g = ng;
        nb.f = ng + heuristic(nb, endNode);
        nb.previousNode = cur;
        if (!open.includes(nb)) open.push(nb);
      }
    }
  }
  return visited;
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getNeighbors(node, grid) {
  const { row, col } = node;
  const nb = [];
  if (row > 0) nb.push(grid[row - 1][col]);
  if (row < grid.length - 1) nb.push(grid[row + 1][col]);
  if (col > 0) nb.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) nb.push(grid[row][col + 1]);
  return nb;
}

export function getNodesInShortestPath(endNode) {
  const path = [];
  let cur = endNode;
  while (cur) { path.unshift(cur); cur = cur.previousNode; }
  return path;
}