import { Floor, Exit } from '@/pages/Index';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
}

export const calculateOptimalPath = (
  start: { x: number; y: number },
  goal: { x: number; y: number },
  floor: Floor,
  gridSize: number = 20
): { x: number; y: number }[] => {
  const openSet: Node[] = [];
  const closedSet: Set<string> = new Set();

  const startNode: Node = {
    x: Math.round(start.x / gridSize) * gridSize,
    y: Math.round(start.y / gridSize) * gridSize,
    g: 0,
    h: heuristic(start, goal),
    f: 0,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    const key = `${current.x},${current.y}`;
    if (closedSet.has(key)) continue;
    closedSet.add(key);

    if (Math.hypot(current.x - goal.x, current.y - goal.y) < gridSize * 2) {
      return reconstructPath(current);
    }

    const neighbors = getNeighbors(current, gridSize, floor);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      const tentativeG = current.g + gridSize;

      const existingNode = openSet.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (!existingNode || tentativeG < existingNode.g) {
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, goal);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;

        if (!existingNode) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [goal];
};

const heuristic = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  return Math.hypot(b.x - a.x, b.y - a.y);
};

const getNeighbors = (node: Node, gridSize: number, floor: Floor): Node[] => {
  const directions = [
    { x: gridSize, y: 0 },
    { x: -gridSize, y: 0 },
    { x: 0, y: gridSize },
    { x: 0, y: -gridSize },
    { x: gridSize, y: gridSize },
    { x: -gridSize, y: -gridSize },
    { x: gridSize, y: -gridSize },
    { x: -gridSize, y: gridSize },
  ];

  const neighbors: Node[] = [];

  for (const dir of directions) {
    const newX = node.x + dir.x;
    const newY = node.y + dir.y;

    if (newX < 0 || newX > 1000 || newY < 0 || newY > 700) continue;

    if (isWallBlocking(node.x, node.y, newX, newY, floor)) continue;

    neighbors.push({
      x: newX,
      y: newY,
      g: 0,
      h: 0,
      f: 0,
    });
  }

  return neighbors;
};

const isWallBlocking = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  floor: Floor
): boolean => {
  for (const wall of floor.walls) {
    if (lineSegmentIntersect(x1, y1, x2, y2, wall.x1, wall.y1, wall.x2, wall.y2)) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      const nearDoor = floor.doors.some(door => {
        const dist = Math.hypot(door.x - midX, door.y - midY);
        return dist < door.width / 2 + 40;
      });
      
      if (!nearDoor) {
        return true;
      }
    }
  }
  return false;
};

const lineSegmentIntersect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean => {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
};

const reconstructPath = (node: Node): { x: number; y: number }[] => {
  const path: { x: number; y: number }[] = [];
  let current: Node | undefined = node;

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  return path;
};

export const checkWallCollision = (
  x: number,
  y: number,
  newX: number,
  newY: number,
  floor: Floor
): { x: number; y: number } => {
  const midX = (x + newX) / 2;
  const midY = (y + newY) / 2;
  
  const nearDoor = floor.doors.some(door => {
    const dist = Math.hypot(door.x - midX, door.y - midY);
    return dist < door.width / 2 + 40;
  });
  
  if (nearDoor) {
    return { x: newX, y: newY };
  }
  
  for (const wall of floor.walls) {
    if (lineSegmentIntersect(x, y, newX, newY, wall.x1, wall.y1, wall.x2, wall.y2)) {
      const wallVector = { x: wall.x2 - wall.x1, y: wall.y2 - wall.y1 };
      const wallLength = Math.sqrt(wallVector.x ** 2 + wallVector.y ** 2);
      const wallNormal = { x: -wallVector.y / wallLength, y: wallVector.x / wallLength };

      const slideX = x + wallNormal.x * 10;
      const slideY = y + wallNormal.y * 10;

      return { x: slideX, y: slideY };
    }
  }

  return { x: newX, y: newY };
};