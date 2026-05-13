import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { animate } from 'animejs';
import { useStore } from '../../store/useStore';
import type { WeatherProperties } from '../../types/maritime';

function getSeverityColor(severity: number): string {
  if (severity < 2) return '#22c55e';
  if (severity < 4) return '#eab308';
  return '#ef4444';
}

function getSeverityLabel(severity: number): string {
  if (severity < 2) return 'Calm';
  if (severity < 4) return 'Caution';
  return 'Severe Storm';
}

export function WeatherLayer() {
  const map = useMap();
  const weatherZones = useStore((s) => s.weatherZones);
  const showWeather = useStore((s) => s.showWeather);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pulseRefs = useRef<Map<string, L.CircleMarker>>(new Map());

  const features = useMemo(() => {
    return weatherZones?.features?.filter((f) => f.geometry.type === 'Polygon') ?? [];
  }, [weatherZones]);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }

    const layer = layerRef.current;

    if (!showWeather) {
      layer.clearLayers();
      pulseRefs.current.clear();
      return;
    }

    const currentIds = new Set(features.map((f) => ((f.properties) as Record<string, unknown>)?.id as string));

    pulseRefs.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        pulseRefs.current.delete(id);
      }
    });

    layer.eachLayer((l) => {
      const key = (l as L.CircleMarker & { _zoneId?: string })._zoneId;
      if (key && !currentIds.has(key)) {
        layer.removeLayer(l);
      }
    });

    features.forEach((feature) => {
      const props = feature.properties as unknown as WeatherProperties;
      if (!props?.id) return;

      const coords = feature.geometry.coordinates as number[][][];
      const ring = coords[0];
      if (!ring || ring.length < 3) return;

      const centerLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
      const centerLng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
      const radiusM = ring.reduce((s, c) => {
        const d = map.distance(L.latLng(centerLat, centerLng), L.latLng(c[1], c[0]));
        return s + d;
      }, 0) / ring.length;

      if (pulseRefs.current.has(props.id)) return;

      const color = getSeverityColor(props.severity);

      const circle = L.circleMarker([centerLat, centerLng], {
        radius: Math.max(20, radiusM / 5000),
        color: color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.5,
      });

      (circle as L.CircleMarker & { _zoneId?: string })._zoneId = props.id;

      circle.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 140px;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px;">${getSeverityLabel(props.severity)}</div>
          <div style="font-size: 12px;">
            <div>Wind: <strong>${props.windSpeed ?? 'N/A'} kn</strong></div>
            <div>Swell: <strong>${props.waveHeight ?? 'N/A'} m</strong></div>
            <div>Severity: <strong>${props.severity?.toFixed(1) ?? 'N/A'}</strong></div>
            <div>Status: <strong>${props.lifecycle ?? 'N/A'}</strong></div>
          </div>
        </div>
      `, { closeButton: false });

      circle.addTo(layer);
      pulseRefs.current.set(props.id, circle);

      if (props.severity >= 4) {
        const el = circle.getElement();
        if (el) {
          animate(el, {
            scale: [1, 1.08, 1],
            duration: 3000,
            easing: 'easeInOutSine',
            loop: true,
          });
        }
      }
    });

    return () => {
      layer.clearLayers();
      pulseRefs.current.clear();
    };
  }, [map, features, showWeather]);

  return null;
}
