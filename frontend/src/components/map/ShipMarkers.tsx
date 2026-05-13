import { useMemo, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import type { ShipProperties, ShipTrailPoint } from '../../types/maritime';

interface ShipAnimState {
  marker: L.Marker;
  trailLine: L.Polyline;
  currentLat: number;
  currentLng: number;
  targetLat: number;
  targetLng: number;
  currentHeading: number;
  targetHeading: number;
  trail: ShipTrailPoint[];
}

const TRAIL_MAX_POINTS = 60;
const INTERP_SPEED = 0.018;

function createShipIcon(heading: number): L.DivIcon {
  const size = 30;
  return L.divIcon({
    className: 'ship-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div class="ship-glow-ring" style="
          position:absolute;inset:-6px;border-radius:50%;
          background:radial-gradient(circle,rgba(59,130,246,0.35),transparent 70%);
          opacity:0.4;pointer-events:none;
        "></div>
        <div class="ship-icon-container group cursor-pointer" style="
          width:${size}px;height:${size}px;
          transform:rotate(${heading}deg);
          filter:drop-shadow(0 0 8px rgba(59,130,246,0.6));
          transition:filter 0.3s ease,transform 0.3s ease;
        ">
          <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#3b82f6" stroke="#1e40af" stroke-width="0.5"
            style="transition:fill 0.3s ease;">
            <path d="M12 2 L4 20 L12 15 L20 20 Z" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function buildTooltipContent(props: ShipProperties): string {
  const name = props.name || 'Unknown';
  const speed = typeof props.speedKnots === 'number' ? props.speedKnots.toFixed(1) : 'N/A';
  const destination = props.destination || 'N/A';
  const eta = typeof props.eta === 'number' ? props.eta.toFixed(1) : 'N/A';
  const status = speed === 'N/A' || parseFloat(speed) < 0.5 ? 'Anchored' : parseFloat(speed) > 18 ? 'Transit' : 'Under Way';

  const statusColors: Record<string, string> = {
    'Anchored': '#ef4444',
    'Under Way': '#eab308',
    'Transit': '#22c55e',
  };

  return `
    <div style="font-family:system-ui,sans-serif;min-width:180px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <div style="width:8px;height:8px;border-radius:50%;background:${statusColors[status] || '#94a3b8'};"></div>
        <div style="font-weight:800;font-size:13px;color:#60a5fa;">${name}</div>
      </div>
      <div style="border-top:1px solid rgba(96,165,250,0.2);margin:4px 0;padding-top:4px;">
        <table style="width:100%;font-size:11px;border-collapse:collapse;">
          <tr><td style="color:#64748b;padding:1px 4px;">Speed</td><td style="font-weight:600;text-align:right;color:#e2e8f0;">${speed} kn</td></tr>
          <tr><td style="color:#64748b;padding:1px 4px;">Destination</td><td style="font-weight:600;text-align:right;color:#e2e8f0;">${destination}</td></tr>
          <tr><td style="color:#64748b;padding:1px 4px;">ETA</td><td style="font-weight:600;text-align:right;color:#e2e8f0;">${eta}h</td></tr>
          <tr><td style="color:#64748b;padding:1px 4px;">Status</td><td style="font-weight:600;text-align:right;color:#e2e8f0;">${status}</td></tr>
        </table>
      </div>
    </div>
  `;
}

export function ShipMarkers() {
  const map = useMap();
  const ships = useStore((s) => s.ships);
  const followShip = useStore((s) => s.followShip);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const trailRef = useRef<L.LayerGroup | null>(null);
  const animsRef = useRef<Map<string, ShipAnimState>>(new Map());
  const rafRef = useRef<number>(0);

  const features = useMemo(() => {
    return ships?.features?.filter((f) => f.geometry.type === 'Point') ?? [];
  }, [ships]);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    if (!trailRef.current) trailRef.current = L.layerGroup().addTo(map);

    const layer = layerRef.current;
    const trailLayer = trailRef.current;
    const anims = animsRef.current;
    const now = Date.now();

    const currentIds = new Set(features.map((f) => ((f.properties) as Record<string, unknown>)?.id as string));

    anims.forEach((state, id) => {
      if (!currentIds.has(id)) {
        layer.removeLayer(state.marker);
        trailLayer.removeLayer(state.trailLine);
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

      let state = anims.get(props.id);

      if (!state) {
        const icon = createShipIcon(heading);
        const marker = L.marker([lat, lng], { icon, zIndexOffset: followShip === props.id ? 2000 : 1000 });

        marker.bindTooltip(buildTooltipContent(props), {
          direction: 'top',
          offset: L.point(0, -22),
          className: 'bg-transparent border-none shadow-none',
        });

        marker.on('click', () => {
          const current = useStore.getState().followShip;
          useStore.getState().setFollowShip(current === props.id ? null : props.id);
        });

        marker.addTo(layer);

        const trailLine = L.polyline([[lat, lng]], {
          color: '#3b82f6',
          weight: 1.5,
          opacity: 0.5,
          dashArray: '4, 6',
        });
        trailLine.addTo(trailLayer);

        state = {
          marker,
          trailLine,
          currentLat: lat,
          currentLng: lng,
          targetLat: lat,
          targetLng: lng,
          currentHeading: heading,
          targetHeading: heading,
          trail: [{ lat, lng, timestamp: now }],
        };
        anims.set(props.id, state);
      } else {
        state.targetLat = lat;
        state.targetLng = lng;
        state.targetHeading = heading;

        state.trail.push({ lat, lng, timestamp: now });
        if (state.trail.length > TRAIL_MAX_POINTS) {
          state.trail = state.trail.slice(-TRAIL_MAX_POINTS);
        }
        state.trailLine.setLatLngs(state.trail.map((p) => [p.lat, p.lng] as [number, number]));

        state.marker.setTooltipContent(buildTooltipContent(props));
        state.marker.setZIndexOffset(followShip === props.id ? 2000 : 1000);

        const container = state.marker.getElement();
        if (container) {
          const glowEl = container.querySelector('.ship-glow-ring') as HTMLElement | null;
          if (glowEl) {
            glowEl.style.background = followShip === props.id
              ? 'radial-gradient(circle,rgba(59,130,246,0.6),transparent 70%)'
              : 'radial-gradient(circle,rgba(59,130,246,0.35),transparent 70%)';
          }
        }
      }
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [map, features, followShip]);

  useEffect(() => {
    let lastTime = performance.now();

    function tick(time: number) {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      animsRef.current.forEach((state) => {
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

        const el = state.marker.getElement();
        if (el) {
          const iconContainer = el.querySelector('.ship-icon-container') as HTMLElement | null;
          if (iconContainer) {
            iconContainer.style.transform = `rotate(${state.currentHeading}deg) scale(1)`;
          }
          const glowEl = el.querySelector('.ship-glow-ring') as HTMLElement | null;
          if (glowEl) {
            glowEl.style.opacity = String(0.25 + Math.sin(time / 800) * 0.15);
          }
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return null;
}
