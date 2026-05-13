import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { animate } from 'animejs';
import { useStore } from '../../store/useStore';
import { ROUTE_COLORS, type OptimizationMode } from '../../types/maritime';

export function RouteLayer() {
  const map = useMap();
  const routes = useStore((s) => s.routes);
  const selectedIndex = useStore((s) => s.selectedRouteIndex);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<Map<OptimizationMode, L.Polyline>>(new Map());

  const routeEntries = useMemo(() => {
    return routes.map((r, i) => ({ route: r, index: i, isSelected: i === selectedIndex }));
  }, [routes, selectedIndex]);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }

    const layer = layerRef.current;
    const polylines = polylinesRef.current;

    polylines.forEach((_, mode) => {
      if (!routes.find((r) => r.mode === mode)) {
        const pl = polylines.get(mode);
        if (pl) {
          layer.removeLayer(pl);
          polylines.delete(mode);
        }
      }
    });

    routeEntries.forEach(({ route, index, isSelected }) => {
      const style = ROUTE_COLORS[route.mode];
      const coords = route.waypoints.map((wp) => [wp.latitude, wp.longitude] as [number, number]);

      if (coords.length < 2) return;

      let polyline = polylines.get(route.mode);

      if (!polyline) {
        const dashArray = style.dash === '1, 0' ? undefined : style.dash;

        polyline = L.polyline(coords, {
          color: style.color,
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 0.9 : 0.5,
          dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        });

        polyline.addTo(layer);

        polyline.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 140px;">
            <div style="font-weight: 800; font-size: 13px; margin-bottom: 6px; color: ${style.color};">
              ${route.mode.toUpperCase()} Route
            </div>
            <div style="font-size: 12px;">
              <div>Distance: <strong>${route.distanceNm.toFixed(0)} nm</strong></div>
              <div>ETA: <strong>${route.etaHours.toFixed(1)} h</strong></div>
              <div>Fuel: <strong>${route.fuelEstimateTonnes.toFixed(0)} t</strong></div>
              <div>Risk: <strong>${route.riskScore.toFixed(0)}%</strong></div>
              <div>Speed: <strong>${route.avgSpeedKnots.toFixed(1)} kn</strong></div>
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
            duration: 1500,
            easing: 'easeInOutQuad',
          });
        }
      } else {
        polyline.setLatLngs(coords);
        polyline.setStyle({
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 0.9 : 0.5,
        });

        if (isSelected) {
          const el = polyline.getElement();
          if (el) {
            animate(el, {
              boxShadow: [
                '0 0 0px rgba(59,130,246,0)',
                `0 0 12px ${style.color}66`,
                '0 0 0px rgba(59,130,246,0)',
              ],
              duration: 2000,
              easing: 'easeInOutSine',
              loop: true,
            });
          }
        }
      }
    });

    if (routeEntries.length > 0) {
      const allCoords = routeEntries.flatMap(({ route }) =>
        route.waypoints.map((wp) => [wp.latitude, wp.longitude] as [number, number]),
      );
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
      }
    }

    return () => {};
  }, [map, routeEntries]);

  useEffect(() => {
    return () => {
      layerRef.current?.clearLayers();
      polylinesRef.current.clear();
    };
  }, []);

  return null;
}
