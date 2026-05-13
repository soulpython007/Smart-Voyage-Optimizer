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
  const waypointRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<Map<OptimizationMode, L.Polyline>>(new Map());

  const routeEntries = useMemo(() => {
    return routes.map((r, i) => ({ route: r, index: i, isSelected: i === selectedIndex }));
  }, [routes, selectedIndex]);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    if (!waypointRef.current) waypointRef.current = L.layerGroup().addTo(map);

    const layer = layerRef.current;
    const waypointLayer = waypointRef.current;
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

    const allVisibleCoords: [number, number][] = [];

    routeEntries.forEach(({ route, index, isSelected }) => {
      const style = ROUTE_COLORS[route.mode];
      const coords = route.waypoints.map((wp) => [wp.latitude, wp.longitude] as [number, number]);
      if (coords.length < 2) return;

      allVisibleCoords.push(...coords);

      let polyline = polylines.get(route.mode);

      if (!polyline) {
        const dashArray = style.dash === '1, 0' ? undefined : style.dash;

        polyline = L.polyline(coords, {
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

        route.waypoints.forEach((wp, i) => {
          const isStart = i === 0;
          const isEnd = i === route.waypoints.length - 1;

          const dot = L.circleMarker([wp.latitude, wp.longitude], {
            radius: isStart || isEnd ? 5 : 3,
            color: style.color,
            fillColor: style.color,
            fillOpacity: isSelected ? 0.8 : 0.4,
            weight: isStart || isEnd ? 2 : 1,
            opacity: isSelected ? 0.9 : 0.5,
          });

          if (isStart) {
            dot.bindTooltip(`Departure: ${route.waypoints[0].latitude.toFixed(2)}°, ${route.waypoints[0].longitude.toFixed(2)}°`, {
              direction: 'bottom',
              className: 'bg-transparent border-none',
            });
          }
          if (isEnd) {
            dot.bindTooltip(`Destination: ${route.waypoints[route.waypoints.length - 1].latitude.toFixed(2)}°, ${route.waypoints[route.waypoints.length - 1].longitude.toFixed(2)}°`, {
              direction: 'top',
              className: 'bg-transparent border-none',
            });
          }

          dot.addTo(waypointLayer);
        });
      } else {
        polyline.setLatLngs(coords);
        polyline.setStyle({
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 0.9 : 0.4,
        });

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
      }
    });

    if (allVisibleCoords.length > 0 && routes.length > 0 && selectedIndex !== null) {
      const bounds = L.latLngBounds(allVisibleCoords);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6, animate: true, duration: 1 });
    }

    return () => {
      waypointLayer.clearLayers();
    };
  }, [map, routeEntries, routes, selectedIndex]);

  useEffect(() => {
    return () => {
      layerRef.current?.clearLayers();
      waypointRef.current?.clearLayers();
      polylinesRef.current.clear();
    };
  }, []);

  return null;
}
