import type { WaypointGraph } from '../graph/WaypointGraph.js';
import { haversineDistance } from '../../utils/geo.js';

class MinHeap<T> {
  private heap: { key: number; value: T }[] = [];

  get size(): number {
    return this.heap.length;
  }

  push(value: T, key: number): void {
    this.heap.push({ key, value });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top.value;
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.heap[parent].key <= this.heap[idx].key) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }

  private sinkDown(idx: number): void {
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < this.heap.length && this.heap[left].key < this.heap[smallest].key) smallest = left;
      if (right < this.heap.length && this.heap[right].key < this.heap[smallest].key) smallest = right;
      if (smallest === idx) break;
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      idx = smallest;
    }
  }
}

export interface AStarResult {
  path: number[];
  found: boolean;
}

export class AStarRouter {
  findPath(
    graph: WaypointGraph,
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    costFn: (fromId: number, toId: number) => number,
  ): AStarResult {
    const startId = graph.findClosestNode(startLat, startLon);
    const endId = graph.findClosestNode(endLat, endLon);

    const openSet = new MinHeap<number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const inOpen = new Set<number>();
    const closed = new Set<number>();

    gScore.set(startId, 0);
    const hStart = haversineDistance(
      graph.getNode(startId)!.lat, graph.getNode(startId)!.lon,
      endLat, endLon,
    );
    fScore.set(startId, hStart);
    openSet.push(startId, hStart);
    inOpen.add(startId);

    let iterations = 0;
    const maxIterations = 150000;

    while (openSet.size > 0 && iterations < maxIterations) {
      iterations++;
      const current = openSet.pop()!;
      inOpen.delete(current);

      if (current === endId) {
        return { path: this.reconstructPath(cameFrom, current, startId), found: true };
      }

      if (closed.has(current)) continue;
      closed.add(current);

      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (closed.has(neighbor)) continue;

        const tentativeG = (gScore.get(current) ?? Infinity) + costFn(current, neighbor);

        if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);

          const h = haversineDistance(
            graph.getNode(neighbor)!.lat, graph.getNode(neighbor)!.lon,
            endLat, endLon,
          );
          const f = tentativeG + h;
          fScore.set(neighbor, f);

          if (!inOpen.has(neighbor)) {
            openSet.push(neighbor, f);
            inOpen.add(neighbor);
          }
        }
      }
    }

    return { path: [], found: false };
  }

  private reconstructPath(
    cameFrom: Map<number, number>,
    current: number,
    startId: number,
  ): number[] {
    const path: number[] = [];
    let node = current;
    while (node !== startId) {
      path.push(node);
      node = cameFrom.get(node)!;
    }
    path.push(startId);
    path.reverse();
    return path;
  }
}
