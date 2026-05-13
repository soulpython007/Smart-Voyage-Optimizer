import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import type { ShipProperties, ShipTrailPoint } from '../types/maritime';

interface ShipAnimState {
  marker: L.Marker;
  trailLayer: L.Polyline | null;
  currentLat: number;
  currentLng: number;
  targetLat: number;
  targetLng: number;
  currentHeading: number;
  targetHeading: number;
  speed: number;
  trail: ShipTrailPoint[];
  label: string;
}

const TRAIL_MAX_POINTS = 50;
const TRAIL_FADE_MS = 30000;
const INTERP_SPEED = 0.02;

export function useShipAnimation() {
  const map = useMap();
  const ships = useStore((s) => s.ships);
  const animRef = useRef<Map<string, ShipAnimState>>(new Map());
  const layerRef = useRef<L.LayerGroup | null>(null);
  const trailLayerRef = useRef<L.LayerGroup | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!map) return;
    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }
    if (!trailLayerRef.current) {
      trailLayerRef.current = L.layerGroup().addTo(map);
    }

    const layer = layerRef.current;
    const trailLayer = trailLayerRef.current;
    const anims = animRef.current;

    const features = ships?.features?.filter((f) => f.geometry.type === 'Point') ?? [];
    const currentIds = new Set(features.map((f) => ((f.properties) as Record<string, unknown>)?.id as string));

    anims.forEach((state, id) => {
      if (!currentIds.has(id)) {
        layer.removeLayer(state.marker);
        if (state.trailLayer) trailLayer.removeLayer(state.trailLayer);
        anims.delete(id);
      }
    });

    features.forEach((feature) => {
      const props = feature.properties as unknown as ShipProperties;
      if (!props?.id) return;

      const coords = feature.geometry.coordinates as number[];
      const lng = coords[0];
      const lat = coords[1];
      const heading = typeof props.heading === 'number' ? props.heading : 0;
      const speed = typeof props.speedKnots === 'number' ? props.speedKnots : 0;
      const now = Date.now();

      let state = anims.get(props.id);

      if (!state) {
        const icon = createShipIcon(heading, false);
        const marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: 1000,
        });

        marker.bindTooltip(buildTooltip(props), {
          direction: 'top',
          offset: L.point(0, -20),
          className: 'ship-tooltip',
        });

        marker.on('click', () => {
          const current = useStore.getState().followShip;
          useStore.getState().setFollowShip(current === props.id ? null : props.id);
        });

        marker.addTo(layer);

        const trail: ShipTrailPoint[] = [{ lat, lng, timestamp: now }];
        const trailLine = L.polyline([[lat, lng]], {
          color: '#3b82f6',
          weight: 1.5,
          opacity: 0.4,
          dashArray: '4, 4',
        });
        trailLine.addTo(trailLayer);

        state = {
          marker,
          trailLayer: trailLine,
          currentLat: lat,
          currentLng: lng,
          targetLat: lat,
          targetLng: lng,
          currentHeading: heading,
          targetHeading: heading,
          speed,
          trail,
          label: props.name || 'Ship',
        };
        anims.set(props.id, state);
      } else {
        state.targetLat = lat;
        state.targetLng = lng;
        state.targetHeading = heading;
        state.speed = speed;

        state.trail.push({ lat, lng, timestamp: now });
        if (state.trail.length > TRAIL_MAX_POINTS) {
          state.trail = state.trail.slice(-TRAIL_MAX_POINTS);
        }

        const trailCoords = state.trail.map((p) => [p.lat, p.lng] as [number, number]);
        state.trailLayer?.setLatLngs(trailCoords);

        const marker = state.marker;
        marker.setTooltipContent(buildTooltip(props));
      }
    });

    const trailLayerConst = trailLayer;
    return () => {
      layer.clearLayers();
      trailLayerConst?.clearLayers();
      anims.clear();
      cancelAnimationFrame(rafRef.current);
    };
  }, [map, ships]);

  useEffect(() => {
    let lastTime = performance.now();

    function tick(time: number) {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      animRef.current.forEach((state) => {
        const dLat = state.targetLat - state.currentLat;
        const dLng = state.targetLng - state.currentLng;

        state.currentLat += dLat * INTERP_SPEED * dt;
        state.currentLng += dLng * INTERP_SPEED * dt;

        let dHead = state.targetHeading - state.currentHeading;
        if (dHead > 180) dHead -= 360;
        if (dHead < -180) dHead += 360;
        state.currentHeading += dHead * INTERP_SPEED * dt;
        if (state.currentHeading < 0) state.currentHeading += 360;
        if (state.currentHeading >= 360) state.currentHeading -= 360;

        state.marker.setLatLng([state.currentLat, state.currentLng]);

        const iconEl = state.marker.getElement()?.querySelector('.ship-icon-container') as HTMLElement | null;
        if (iconEl) {
          iconEl.style.transform = `rotate(${state.currentHeading}deg)`;
        }

        const glowEl = state.marker.getElement()?.querySelector('.ship-glow-ring') as HTMLElement | null;
        if (glowEl) {
          glowEl.style.opacity = String(0.3 + Math.sin(time / 1000) * 0.2);
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return null;
}

function createShipIcon(heading: number, isSelected: boolean): L.DivIcon {
  const size = 28;
  return L.divIcon({
    className: 'ship-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div class="ship-glow-ring" style="
          position:absolute;inset:-4px;border-radius:50%;
          background:radial-gradient(circle,rgba(59,130,246,0.4),transparent 70%);
          opacity:0.3;pointer-events:none;
        "></div>
        <div class="ship-icon-container" style="
          width:${size}px;height:${size}px;
          transform:rotate(${heading}deg);
          transition: none;
          filter:drop-shadow(0 0 6px rgba(59,130,246,0.5));
        ">
          <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#2563eb" stroke="#1e40af" stroke-width="0.5">
            <path d="M12 2 L4 20 L12 16 L20 20 Z" />
            <circle cx="12" cy="14" r="2" fill="#1e40af" opacity="0.5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function buildTooltip(props: ShipProperties): string {
  const name = props.name || 'Unknown';
  const speed = typeof props.speedKnots === 'number' ? props.speedKnots.toFixed(1) : 'N/A';
  const destination = props.destination || 'N/A';
  const eta = typeof props.eta === 'number' ? props.eta.toFixed(1) : 'N/A';

  return `
    <div style="font-family:system-ui,sans-serif;min-width:160px;">
      <div style="font-weight:800;font-size:14px;margin-bottom:2px;color:#60a5fa;">${name}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Speed: ${speed} kn | Dest: ${destination}</div>
      <div style="font-size:11px;color:#94a3b8;">ETA: ${eta}h</div>
    </div>
  `;
}
