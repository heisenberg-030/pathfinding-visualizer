export function dijkstra(grid, startNode, endNode) {
  const visited = [];
  startNode.distance = 0;
  const unvisited = getAllNodes(grid);

  while (unvisited.length) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift();
    if (closest.isWall) continue;
    if (closest.distance === Infinity) return visited;
    closest.isVisited = true;
    visited.push(closest);
    if (closest === endNode) return visited;
    updateNeighbors(closest, grid);
  }
  return visited;
}

function updateNeighbors(node, grid) {
  for (const nb of getNeighbors(node, grid)) {
    const newDist = node.distance + nb.weight;
    if (newDist < nb.distance) {
      nb.distance = newDist;
      nb.previousNode = node;
    }
  }
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) for (const node of row) nodes.push(node);
  return nodes;
}

function getNeighbors(node, grid) {
  const { row, col } = node;
  const nb = [];
  if (row > 0) nb.push(grid[row - 1][col]);
  if (row < grid.length - 1) nb.push(grid[row + 1][col]);
  if (col > 0) nb.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) nb.push(grid[row][col + 1]);
  return nb.filter(n => !n.isVisited);
}

export function getNodesInShortestPath(endNode) {
  const path = [];
  let cur = endNode;
  while (cur) { path.unshift(cur); cur = cur.previousNode; }
  return path;
}