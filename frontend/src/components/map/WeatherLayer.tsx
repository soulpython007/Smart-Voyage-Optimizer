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

  const features = useMemo(() => {
    return weatherZones?.features?.filter((f) => f.geometry.type === 'Polygon') ?? [];
  }, [weatherZones]);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;

    layer.clearLayers();

    if (!showWeather) return;

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

      const color = getSeverityColor(props.severity);

      const polygon = L.polygon(
        ring.map((c) => [c[1], c[0]] as [number, number]),
        {
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 2,
          opacity: 0.6,
        },
      );

      polygon.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:150px;">
          <div style="font-weight:800;font-size:13px;margin-bottom:4px;color:${color};">${getSeverityLabel(props.severity)}</div>
          <div style="font-size:12px;color:#94a3b8;">
            <div>Wind: <strong style="color:#e2e8f0;">${props.windSpeed ?? 'N/A'} kn</strong></div>
            <div>Swell: <strong style="color:#e2e8f0;">${props.waveHeight ?? 'N/A'} m</strong></div>
            <div>Severity: <strong style="color:#e2e8f0;">${props.severity?.toFixed(1) ?? 'N/A'}</strong></div>
            <div>Status: <strong style="color:#e2e8f0;">${props.lifecycle ?? 'N/A'}</strong></div>
          </div>
        </div>
      `, { closeButton: false });

      polygon.addTo(layer);

      const el = polygon.getElement();
      if (el) {
        animate(el, {
          opacity: [0.4, 0.8, 0.4],
          duration: 4000,
          easing: 'easeInOutSine',
          loop: true,
        });

        const innerCircle = L.circleMarker([centerLat, centerLng], {
          radius: Math.max(15, radiusM / 6000),
          color: color,
          fillColor: color,
          fillOpacity: 0.05,
          weight: 1,
          opacity: 0.3,
        });
        innerCircle.addTo(layer);

        animate(innerCircle.getElement()!, {
          scale: [0.95, 1.05, 0.95],
          opacity: [0.15, 0.35, 0.15],
          duration: 5000,
          easing: 'easeInOutSine',
          loop: true,
        });

        if (props.severity >= 3) {
          for (let i = 0; i < 3; i++) {
            const outerRing = L.circleMarker([centerLat, centerLng], {
              radius: Math.max(20, radiusM / 5000) * (1 + i * 0.15),
              color: color,
              fill: false,
              weight: 1,
              opacity: 0.15,
            });
            outerRing.addTo(layer);

            animate(outerRing.getElement()!, {
              opacity: [0.15, 0.3, 0.15],
              scale: [0.98 + i * 0.02, 1.02 + i * 0.02, 0.98 + i * 0.02],
              duration: 3000 + i * 800,
              easing: 'easeInOutSine',
              loop: true,
              delay: i * 400,
            });
          }
        }
      }
    });

    return () => {
      layer.clearLayers();
    };
  }, [map, features, showWeather]);

  return null;
}
