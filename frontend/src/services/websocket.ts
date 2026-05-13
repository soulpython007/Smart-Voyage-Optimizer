import { io, Socket } from 'socket.io-client';
import type { GeoJSONFeatureCollection } from '../types/maritime';
import { API_CONFIG } from '../api/config';
import type { ConnectionState } from '../components/ui/ConnectionStatus';

type Listener = (data: unknown) => void;
type ConnectionListener = (state: ConnectionState) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private connectionListeners = new Set<ConnectionListener>();
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.emitConnectionState('live');
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        this.emitConnectionState('offline');
      } else {
        this.emitConnectionState('reconnecting');
      }
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emitConnectionState('offline');
      } else {
        this.emitConnectionState('reconnecting');
      }
    });

    this.socket.on('reconnect', () => {
      this.reconnectAttempts = 0;
      this.emitConnectionState('live');
    });

    this.socket.on('reconnect_failed', () => {
      this.emitConnectionState('offline');
    });

    this.socket.on('initialState', (data: unknown) => {
      this.emit('initialState', data);
    });

    this.socket.on('shipPositionUpdate', (data: GeoJSONFeatureCollection) => {
      this.emit('shipPositionUpdate', data);
    });

    this.socket.on('weatherUpdate', (data: GeoJSONFeatureCollection) => {
      this.emit('weatherUpdate', data);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
    this.emitConnectionState('offline');
  }

  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  onConnectionState(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }

  private emitConnectionState(state: ConnectionState): void {
    this.connectionListeners.forEach((fn) => fn(state));
  }
}

export const wsService = new WebSocketService(API_CONFIG.wsUrl || 'http://localhost:4000');
