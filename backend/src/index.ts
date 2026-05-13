import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

import portRoutes from './routes/ports.js';
import shipRoutes from './routes/ships.js';
import weatherRoutes from './routes/weather.js';
import currentRoutes from './routes/currents.js';
import optimizeRoutes from './routes/optimize.js';
import savedRoutesRouter from './routes/savedRoutes.js';
import voyageHistoryRouter from './routes/voyageHistory.js';
import preferencesRouter from './routes/preferences.js';

import { WeatherEngine } from './simulators/WeatherEngine.js';
import { ShipTracker } from './simulators/ShipTracker.js';
import { OceanCurrentEngine } from './simulators/OceanCurrentEngine.js';
import { RouteOptimizer } from './services/routeOptimizer.js';
import { createSocketServer } from './websocket/socketServer.js';

const app = express();
const httpServer = createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

const weatherEngine = new WeatherEngine();
const shipTracker = new ShipTracker();
const currentEngine = new OceanCurrentEngine();
const routeOptimizer = new RouteOptimizer(weatherEngine, currentEngine);

app.use(portRoutes);
app.use(shipRoutes(shipTracker));
app.use(weatherRoutes(weatherEngine));
app.use(currentRoutes(currentEngine));
app.use(optimizeRoutes(routeOptimizer));

app.use(savedRoutesRouter);
app.use(voyageHistoryRouter);
app.use(preferencesRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    res.status(400).json({ error: 'lat and lon query parameters are required' });
    return;
  }
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENWEATHER_API_KEY is not configured' });
    return;
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('OpenWeather proxy error:', err);
    res.status(502).json({ error: 'Failed to fetch weather data' });
  }
});

const io = createSocketServer(httpServer, shipTracker, weatherEngine);

setInterval(() => weatherEngine.tick(), 60000);
setInterval(() => shipTracker.tick(), 5000);
setInterval(() => currentEngine.tick(), 30000);

const port = parseInt(process.env.PORT || '4000');
httpServer.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

export default app;
