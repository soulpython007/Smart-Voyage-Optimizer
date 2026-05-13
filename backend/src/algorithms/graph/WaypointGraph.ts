import type { GraphNode } from '../../types/index.js';

const BOUNDS = { minLat: -10, maxLat: 32, minLon: 30, maxLon: 110 };
const SPACING_DEG = 0.5;

const LAND_RECTANGLES: [number, number, number, number][] = [
  // India - northwest (Gujarat, Rajasthan)
  [22, 32, 68, 77],
  // India - north central
  [22, 31, 77, 84],
  // India - northeast (West Bengal)
  [22, 28, 84, 89],
  // India - central east coast (Odisha)
  [18, 22, 83, 88],
  // India - central interior (Telangana)
  [16, 22, 78, 83],
  // India - southeast (Tamil Nadu)
  [10, 18, 79, 81],
  // India - southern tip (Kerala)
  [8, 12, 76.5, 78],
  // Sri Lanka
  [6, 10, 79.5, 82],
  // Arabian Peninsula
  [14, 29, 36, 60],
  // Horn of Africa / Somalia
  [0, 12, 41, 51],
  // Iran / Pakistan coast
  [25, 30, 58, 67],
  // Indochina (Thailand, Myanmar)
  [10, 22, 98, 106],
  // Malay Peninsula (narrow - only the land)
  [7, 16, 100, 105],
  [2, 7, 101.5, 104],
  // Sumatra
  [-6, 0.5, 101, 106],
  // Java
  [-7, -5, 107, 115],
  // Borneo
  [-2, 6.5, 111, 119],
  // East Africa (inland only)
  [-10, -2, 30, 38],
];

function isOnLand(lat: number, lon: number): boolean {
  for (const [minLat, maxLat, minLon, maxLon] of LAND_RECTANGLES) {
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      return true;
    }
  }
  return false;
}

export class WaypointGraph {
  nodes: GraphNode[] = [];
  private nodeMap = new Map<string, number>();
  rows: number;
  cols: number;

  constructor() {
    this.rows = Math.round((BOUNDS.maxLat - BOUNDS.minLat) / SPACING_DEG) + 1;
    this.cols = Math.round((BOUNDS.maxLon - BOUNDS.minLon) / SPACING_DEG) + 1;
    this.buildGraph();
  }

  private buildGraph(): void {
    let id = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const lat = BOUNDS.minLat + r * SPACING_DEG;
        const lon = BOUNDS.minLon + c * SPACING_DEG;
        if (!isOnLand(lat, lon)) {
          const node: GraphNode = { id, lat, lon, row: r, col: c };
          this.nodes.push(node);
          this.nodeMap.set(`${r},${c}`, id);
          id++;
        }
      }
    }
  }

  getNode(id: number): GraphNode | undefined {
    return this.nodes[id];
  }

  nodeCount(): number {
    return this.nodes.length;
  }

  getNeighbors(nodeId: number): number[] {
    const node = this.nodes[nodeId];
    if (!node) return [];
    const neighbors: number[] = [];
    const dirs: [number, number][] = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];
    for (const [dr, dc] of dirs) {
      const key = `${node.row + dr},${node.col + dc}`;
      const nid = this.nodeMap.get(key);
      if (nid !== undefined) {
        neighbors.push(nid);
      }
    }
    return neighbors;
  }

  findClosestNode(lat: number, lon: number): number {
    const cRow = Math.round((lat - BOUNDS.minLat) / SPACING_DEG);
    const cCol = Math.round((lon - BOUNDS.minLon) / SPACING_DEG);
    const clampedRow = Math.max(0, Math.min(this.rows - 1, cRow));
    const clampedCol = Math.max(0, Math.min(this.cols - 1, cCol));

    const directKey = `${clampedRow},${clampedCol}`;
    const directId = this.nodeMap.get(directKey);
    if (directId !== undefined) return directId;

    let bestId = -1;
    let bestDist = Infinity;
    const searchRadius = 10;
    const minR = Math.max(0, clampedRow - searchRadius);
    const maxR = Math.min(this.rows - 1, clampedRow + searchRadius);
    const minC = Math.max(0, clampedCol - searchRadius);
    const maxC = Math.min(this.cols - 1, clampedCol + searchRadius);
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const key = `${r},${c}`;
        const id = this.nodeMap.get(key);
        if (id !== undefined) {
          const nlat = BOUNDS.minLat + r * SPACING_DEG;
          const nlon = BOUNDS.minLon + c * SPACING_DEG;
          const d = Math.abs(nlat - lat) + Math.abs(nlon - lon);
          if (d < bestDist) {
            bestDist = d;
            bestId = id;
          }
        }
      }
    }
    if (bestId >= 0) return bestId;

    for (const [key, id] of this.nodeMap) {
      const [r, col] = key.split(',').map(Number);
      const nlat = BOUNDS.minLat + r * SPACING_DEG;
      const nlon = BOUNDS.minLon + col * SPACING_DEG;
      const d = Math.abs(nlat - lat) + Math.abs(nlon - lon);
      if (d < bestDist) {
        bestDist = d;
        bestId = id;
      }
    }
    return bestId;
  }
}
