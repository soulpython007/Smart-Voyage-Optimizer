import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import type { ShipTracker } from '../simulators/ShipTracker.js';
import type { WeatherEngine } from '../simulators/WeatherEngine.js';

const corsOrigin = process.env.CORS_ORIGIN || '*';

export function createSocketServer(
  httpServer: HttpServer,
  shipTracker: ShipTracker,
  weatherEngine: WeatherEngine,
): Server {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    socket.emit('initialState', {
      ships: shipTracker.getShips(),
      weather: weatherEngine.getZones(),
    });

    socket.on('disconnect', (reason) => {
      console.log(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  setInterval(() => {
    io.emit('shipPositionUpdate', shipTracker.getShips());
  }, 5000);

  setInterval(() => {
    io.emit('weatherUpdate', weatherEngine.getZones());
  }, 60000);

  return io;
}
