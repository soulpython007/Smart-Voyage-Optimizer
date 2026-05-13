import { WaypointGraph } from '../algorithms/graph/WaypointGraph.js';

export class GraphService {
  private static instance: GraphService;
  private _graph: WaypointGraph;

  private constructor() {
    this._graph = new WaypointGraph();
  }

  static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService();
    }
    return GraphService.instance;
  }

  get graph(): WaypointGraph {
    return this._graph;
  }
}
