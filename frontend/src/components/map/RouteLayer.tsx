import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { animate } from 'animejs';
import { useStore } from '../../store/useStore';
import { ROUTE_COLORS, type OptimizationMode } from '../../types/maritime';

function validateCoords(wp: { latitude: number; longitude: number }): boolean {
  return (
    typeof wp.latitude === 'number' && isFinite(wp.latitude) &&
    typeof wp.longitude === 'number' && isFinite(wp.longitude) &&
    wp.latitude >= -90 && wp.latitude <= 90 &&
    wp.longitude >= -180 && wp.longitude <= 180
  );
}

export function RouteLayer() {
  const map = useMap();
  const routes = useStore((s) => s.routes);
  const selectedIndex = useStore((s) => s.selectedRouteIndex);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<Map<OptimizationMode, L.Polyline>>(new Map());
  const prevRoutesLenRef = useRef(0);

  const routeEntries = useMemo(() => {
    return routes.map((r, i) => ({ route: r, index: i, isSelected: i === selectedIndex }));
  }, [routes, selectedIndex]);

  const routesChanged = routes.length !== prevRoutesLenRef.current;

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    if (!markersRef.current) markersRef.current = L.layerGroup().addTo(map);

    const layer = layerRef.current;
    const markerLayer = markersRef.current;
    const polylines = polylinesRef.current;

    layer.clearLayers();
    markerLayer.clearLayers();
    polylines.clear();

    const allCoords: [number, number][] = [];

    routeEntries.forEach(({ route, index, isSelected }) => {
      const style = ROUTE_COLORS[route.mode];
      const validWaypoints = route.waypoints.filter(validateCoords);

      if (validWaypoints.length < 2) return;

      const coords = validWaypoints.map((wp) => [wp.latitude, wp.longitude] as [number, number]);
      allCoords.push(...coords);

      const dashArray = style.dash === '1, 0' ? undefined : style.dash;

      const polyline = L.polyline(coords, {
        color: style.color,
        weight: isSelected ? 5 : 3,
        opacity: isSelected ? 0.9 : 0.4,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.addTo(layer);

      polyline.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:150px;">
          <div style="font-weight:800;font-size:13px;margin-bottom:6px;color:${style.color};text-transform:uppercase;letter-spacing:0.5px;">
            ${route.mode.toUpperCase()} Route
          </div>
          <div style="font-size:12px;color:#94a3b8;">
            <div>Distance: <strong style="color:#e2e8f0;">${route.distanceNm.toFixed(0)} nm</strong></div>
            <div>ETA: <strong style="color:#e2e8f0;">${route.etaHours.toFixed(1)} h</strong></div>
            <div>Fuel: <strong style="color:#e2e8f0;">${route.fuelEstimateTonnes.toFixed(0)} t</strong></div>
            <div>Risk: <strong style="color:#e2e8f0;">${route.riskScore.toFixed(0)}%</strong></div>
          </div>
        </div>
      `, { closeButton: false });

      polyline.on('click', () => {
        useStore.getState().selectRoute(index);
      });

      polylines.set(route.mode, polyline);

      const pathEl = polyline.getElement()?.querySelector('path');
      if (pathEl) {
        const length = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = String(length);
        pathEl.style.strokeDashoffset = String(length);

        animate(pathEl, {
          strokeDashoffset: [length, 0],
          duration: 2000,
          easing: 'easeInOutCubic',
        });
      }

      if (isSelected) {
        const el = polyline.getElement();
        if (el) {
          animate(el, {
            boxShadow: [
              `0 0 0px ${style.color}00`,
              `0 0 14px ${style.color}88`,
              `0 0 0px ${style.color}00`,
            ],
            duration: 2000,
            easing: 'easeInOutSine',
            loop: true,
          });
        }
      }

      if (isSelected && validWaypoints.length >= 2) {
        const first = validWaypoints[0];
        const last = validWaypoints[validWaypoints.length - 1];

        const depMarker = L.circleMarker([first.latitude, first.longitude], {
          radius: 7,
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 0.9,
          weight: 2,
          opacity: 1,
        });
        depMarker.bindTooltip(`Departure`, { direction: 'bottom', className: 'bg-transparent border-none' });
        depMarker.addTo(markerLayer);

        animate(depMarker.getElement()!, {
          scale: [1, 1.3, 1],
          opacity: [0.9, 1, 0.9],
          duration: 2000,
          easing: 'easeInOutSine',
          loop: true,
        });

        const destMarker = L.circleMarker([last.latitude, last.longitude], {
          radius: 7,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.9,
          weight: 2,
          opacity: 1,
        });
        destMarker.bindTooltip(`Destination`, { direction: 'top', className: 'bg-transparent border-none' });
        destMarker.addTo(markerLayer);

        animate(destMarker.getElement()!, {
          scale: [1, 1.3, 1],
          opacity: [0.9, 1, 0.9],
          duration: 2000,
          easing: 'easeInOutSine',
          loop: true,
        });

        validWaypoints.forEach((wp, i) => {
          if (i === 0 || i === validWaypoints.length - 1) return;
          const dot = L.circleMarker([wp.latitude, wp.longitude], {
            radius: 2.5,
            color: style.color,
            fillColor: style.color,
            fillOpacity: 0.5,
            weight: 1,
            opacity: 0.6,
          });
          dot.addTo(markerLayer);
        });
      }
    });

    prevRoutesLenRef.current = routes.length;

    if (allCoords.length >= 2) {
      try {
        const bounds = L.latLngBounds(allCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 6, animate: true, duration: 1.2 });
        }
      } catch {
      }
    }

    return () => {};
  }, [map, routeEntries]);

  useEffect(() => {
    return () => {
      layerRef.current?.clearLayers();
      markersRef.current?.clearLayers();
      polylinesRef.current.clear();
    };
  }, []);

  return null;
}
