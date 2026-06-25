export function dfs(grid, startNode, endNode) {
  const visited = [];
  const stack = [startNode];

  while (stack.length) {
    const cur = stack.pop();
    if (cur.isVisited || cur.isWall) continue;
    cur.isVisited = true;
    visited.push(cur);
    if (cur === endNode) return visited;

    for (const nb of getNeighbors(cur, grid)) {
      if (!nb.isVisited && !nb.isWall) {
        nb.previousNode = cur;
        stack.push(nb);
      }
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
  return nb;
}

export function getNodesInShortestPath(endNode) {
  const path = [];
  let cur = endNode;
  while (cur) { path.unshift(cur); cur = cur.previousNode; }
  return path;
}