import portsData from '../data/ports.json' with { type: 'json' };
import type {
  Port,
  RouteRequest,
  OptimizeResponse,
  OptimizationMode,
} from '../types/index.js';
import { WeatherEngine } from '../simulators/WeatherEngine.js';
import { OceanCurrentEngine } from '../simulators/OceanCurrentEngine.js';
import { GraphService } from './GraphService.js';
import { CostEngine } from '../algorithms/costs/CostEngine.js';
import { RouteOptimizerEngine } from '../algorithms/optimization/Optimizer.js';

const portMap = new Map((portsData as Port[]).map((p) => [p.id, p]));

const DEFAULT_SPEED_KNOTS = 18;
const DEFAULT_FUEL_RATE = 185;

export class RouteOptimizer {
  private graphService = GraphService.getInstance();
  private optimizerEngine: RouteOptimizerEngine;
  private costEngine: CostEngine;

  constructor(
    private weatherEngine: WeatherEngine,
    private currentEngine: OceanCurrentEngine,
  ) {
    this.costEngine = new CostEngine(
      this.weatherEngine.getStorms(),
      this.currentEngine,
    );
    this.optimizerEngine = new RouteOptimizerEngine(
      this.graphService.graph,
      this.costEngine,
      this.weatherEngine.getStorms(),
    );
  }

  optimize(req: RouteRequest): OptimizeResponse | { error: string } {
    const src = portMap.get(req.from);
    const dst = portMap.get(req.to);
    if (!src || !dst) {
      return { error: `Port not found: ${!src ? req.from : req.to}` };
    }

    const mode: OptimizationMode = req.mode ?? 'eco';

    const customWeights = mode === 'custom' ? req.weights : undefined;

    const routes = this.optimizerEngine.computeAllModes(
      src.latitude, src.longitude,
      dst.latitude, dst.longitude,
      DEFAULT_SPEED_KNOTS,
      DEFAULT_FUEL_RATE,
      mode,
      customWeights,
    );

    if (routes.length === 0) {
      return { error: 'No viable route found' };
    }

    return { routes, from: req.from, to: req.to };
  }
}
