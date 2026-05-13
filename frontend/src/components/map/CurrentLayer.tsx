import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { animate } from 'animejs';
import { useStore } from '../../store/useStore';
import type { CurrentProperties } from '../../types/maritime';

const GRID_STEP = 2;
const MAX_ARROWS = 150;

export function CurrentLayer() {
  const map = useMap();
  const currents = useStore((s) => s.currents);
  const showCurrents = useStore((s) => s.showCurrents);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const flowRef = useRef<L.LayerGroup | null>(null);

  const cells = useMemo(() => {
    if (!currents?.features) return [];
    return currents.features
      .filter((f) => f.geometry.type === 'Point')
      .map((f) => ({
        coords: f.geometry.coordinates as number[],
        props: f.properties as unknown as CurrentProperties,
      }))
      .filter((c) => {
        const [lng, lat] = c.coords;
        return (
          Math.abs(lat - Math.round(lat / GRID_STEP) * GRID_STEP) < 0.1 &&
          Math.abs(lng - Math.round(lng / GRID_STEP) * GRID_STEP) < 0.1
        );
      })
      .slice(0, MAX_ARROWS);
  }, [currents]);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    if (!flowRef.current) flowRef.current = L.layerGroup().addTo(map);

    const layer = layerRef.current;
    const flowLayer = flowRef.current;

    layer.clearLayers();
    flowLayer.clearLayers();

    if (!showCurrents) return;

    cells.forEach((cell) => {
      const [lng, lat] = cell.coords;
      const { direction, speedKnots } = cell.props;
      const arrowSize = Math.max(6, Math.min(20, speedKnots * 5));
      const rad = (direction * Math.PI) / 180;
      const intensity = Math.min(speedKnots / 3, 1);

      const svg = `
        <svg width="${arrowSize * 2}" height="${arrowSize * 2}" viewBox="0 0 24 24"
          style="transform: rotate(${direction}deg); filter: drop-shadow(0 0 3px rgba(59,130,246,0.3));">
          <polygon points="12,2 6,20 12,15 18,20"
            fill="${speedKnots > 2 ? '#3b82f6' : '#60a5fa'}"
            stroke="#1e40af" stroke-width="0.5"
            opacity="${0.3 + intensity * 0.4}"/>
        </svg>
      `;

      const icon = L.divIcon({
        className: 'current-arrow',
        html: svg,
        iconSize: [arrowSize * 2, arrowSize * 2],
        iconAnchor: [arrowSize, arrowSize],
      });

      const marker = L.marker([lat, lng], {
        icon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 500,
      });

      marker.addTo(layer);

      const el = marker.getElement()?.querySelector('svg') as HTMLElement | null;
      if (el) {
        animate(el, {
          translateY: [
            { value: '-3px', duration: 2000 + speedKnots * 200 },
            { value: '3px', duration: 2000 + speedKnots * 200 },
          ],
          loop: true,
          easing: 'easeInOutSine',
          direction: 'alternate',
        });
      }

      const flowDist = speedKnots * 0.05;
      const flowLat = lat + Math.cos(rad) * flowDist;
      const flowLng = lng + Math.sin(rad) * flowDist;

      const flowLine = L.polyline(
        [[lat, lng], [flowLat, flowLng]],
        {
          color: '#3b82f6',
          weight: 1,
          opacity: 0.1 + intensity * 0.15,
          dashArray: '3, 5',
        },
      );
      flowLine.addTo(flowLayer);

      for (let i = 0; i < 2; i++) {
        const dotLat = lat + Math.cos(rad) * flowDist * (i + 0.3);
        const dotLng = lng + Math.sin(rad) * flowDist * (i + 0.3);
        const dot = L.circleMarker([dotLat, dotLng], {
          radius: 1.5,
          color: '#60a5fa',
          fillColor: '#60a5fa',
          fillOpacity: 0.4,
          weight: 0,
          opacity: 0,
        });
        dot.addTo(flowLayer);

        const dotEl = dot.getElement();
        if (dotEl) {
          const endLat = lat + Math.cos(rad) * flowDist * 2;
          const endLng = lng + Math.sin(rad) * flowDist * 2;
          animate(dotEl, {
            opacity: [0, 0.5, 0],
            translateX: [0, (endLng - lng) * 111000 * Math.cos((lat * Math.PI) / 180), (endLng - lng) * 222000 * Math.cos((lat * Math.PI) / 180)],
            translateY: [0, (endLat - lat) * 111000, (endLat - lat) * 222000],
            duration: 4000 + i * 1500,
            easing: 'linear',
            loop: true,
            delay: i * 1200,
          });
        }
      }
    });

    return () => {
      layer.clearLayers();
      flowLayer.clearLayers();
    };
  }, [map, cells, showCurrents]);

  return null;
}
