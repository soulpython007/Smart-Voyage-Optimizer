import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { animate } from 'animejs';
import { useStore } from '../../store/useStore';
import type { CurrentProperties } from '../../types/maritime';

const GRID_STEP = 1.5;
const MAX_ARROWS = 200;

export function CurrentLayer() {
  const map = useMap();
  const currents = useStore((s) => s.currents);
  const showCurrents = useStore((s) => s.showCurrents);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const arrowRefs = useRef<Map<string, { marker: L.Marker; speed: number; direction: number }>>(new Map());

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

    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }

    const layer = layerRef.current;

    if (!showCurrents) {
      layer.clearLayers();
      arrowRefs.current.clear();
      return;
    }

    const currentIds = new Set(cells.map((_, i) => `arrow-${i}`));

    arrowRefs.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        arrowRefs.current.delete(id);
      }
    });

    layer.eachLayer((l) => {
      const key = (l as L.Marker & { _arrowId?: string })._arrowId;
      if (key && !currentIds.has(key)) {
        layer.removeLayer(l);
      }
    });

    cells.forEach((cell, i) => {
      const [lng, lat] = cell.coords;
      const { direction, speedKnots } = cell.props;
      const arrowId = `arrow-${i}`;

      if (arrowRefs.current.has(arrowId)) return;

      const arrowSize = Math.max(8, Math.min(24, speedKnots * 6));

      const svg = `
        <svg width="${arrowSize * 2}" height="${arrowSize * 2}" viewBox="0 0 24 24"
          style="transform: rotate(${direction}deg); filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));">
          <polygon points="12,2 6,20 12,15 18,20" fill="${speedKnots > 2 ? '#3b82f6' : '#93c5fd'}"
            stroke="#1e40af" stroke-width="0.5" opacity="0.7"/>
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

      (marker as L.Marker & { _arrowId?: string })._arrowId = arrowId;
      marker.addTo(layer);
      arrowRefs.current.set(arrowId, { marker, speed: speedKnots, direction });

      const el = marker.getElement()?.querySelector('svg') as HTMLElement | null;
      if (el) {
        animate(el, {
          translateY: [
            { value: '-2px', duration: 2000 },
            { value: '2px', duration: 2000 },
          ],
          loop: true,
          easing: 'easeInOutSine',
          direction: 'alternate',
        });
      }
    });

    return () => {};
  }, [map, cells, showCurrents]);

  return null;
}
