import { useMemo, useRef, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { animate } from 'animejs';
import { useStore } from '../../store/useStore';
import type { ShipProperties } from '../../types/maritime';

function createShipIcon(heading: number): L.DivIcon {
  const size = 28;
  return L.divIcon({
    className: 'ship-marker',
    html: `
      <div class="ship-icon-container" style="
        width: ${size}px; height: ${size}px;
        transform: rotate(${heading}deg);
        transition: transform 1.5s ease-in-out;
      ">
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#1e40af" stroke="#1e3a8a" stroke-width="0.5">
          <path d="M12 2 L4 20 L12 16 L20 20 Z" />
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function buildPopupContent(props: ShipProperties): string {
  const name = props.name || 'Unknown';
  const type = props.type || 'N/A';
  const speed = typeof props.speedKnots === 'number' ? props.speedKnots.toFixed(1) : 'N/A';
  const heading = typeof props.heading === 'number' ? props.heading.toFixed(0) : 'N/A';
  const eta = typeof props.eta === 'number' ? props.eta.toFixed(1) : 'N/A';

  return `
    <div class="ship-popup" style="font-family: system-ui, sans-serif; min-width: 160px;">
      <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #1e3a8a;">${name}</div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${type}</div>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr><td style="color: #6b7280; padding: 1px 4px;">Speed</td><td style="font-weight: 600; text-align: right;">${speed} kn</td></tr>
        <tr><td style="color: #6b7280; padding: 1px 4px;">Heading</td><td style="font-weight: 600; text-align: right;">${heading}°</td></tr>
        <tr><td style="color: #6b7280; padding: 1px 4px;">ETA</td><td style="font-weight: 600; text-align: right;">${eta}h</td></tr>
      </table>
    </div>
  `;
}

export function ShipMarkers() {
  const map = useMap();
  const ships = useStore((s) => s.ships);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const prevPositionsRef = useRef<Map<string, [number, number]>>(new Map());

  const features = useMemo(() => {
    return ships?.features?.filter((f) => f.geometry.type === 'Point') ?? [];
  }, [ships]);

  const animateMarker = useCallback((marker: L.Marker, lat: number, lng: number, heading: number) => {
    const current = marker.getLatLng();
    const proxy = { lat: current.lat, lng: current.lng, heading: 0 };

    animate(proxy, {
      lat: lat,
      lng: lng,
      duration: 4000,
      easing: 'easeInOutQuad',
      onUpdate: () => {
        marker.setLatLng([proxy.lat, proxy.lng]);
      },
      onComplete: () => {
        marker.setLatLng([lat, lng]);
      },
    });

    const iconEl = marker.getElement()?.querySelector('.ship-icon-container') as HTMLElement | null;
    if (iconEl) {
      iconEl.style.transition = 'transform 1.5s ease-in-out';
      iconEl.style.transform = `rotate(${heading}deg)`;
    }
  }, []);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }

    const layer = layerRef.current;
    const markers = markersRef.current;
    const prevPositions = prevPositionsRef.current;

    const currentIds = new Set(features.map((f) => ((f.properties) as Record<string, unknown>)?.id as string));

    markers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        layer.removeLayer(marker);
        markers.delete(id);
        prevPositions.delete(id);
      }
    });

    features.forEach((feature) => {
      const props = feature.properties as unknown as ShipProperties;
      if (!props?.id) return;

      const coords = feature.geometry.coordinates as number[];
      const lng = coords[0];
      const lat = coords[1];
      const heading = typeof props.heading === 'number' ? props.heading : 0;

      let marker = markers.get(props.id);

      if (!marker) {
        const icon = createShipIcon(heading);
        marker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(layer);
        marker.bindPopup(buildPopupContent(props), { closeButton: false, className: 'ship-popup-container' });
        markers.set(props.id, marker);
        prevPositions.set(props.id, [lat, lng]);
      } else {
        const prevPos = prevPositions.get(props.id);
        const dist = prevPos ? Math.sqrt((lat - prevPos[0]) ** 2 + (lng - prevPos[1]) ** 2) : 0;

        if (dist > 0.001) {
          marker.setLatLng([lat, lng]);
          const icon = createShipIcon(heading);
          marker.setIcon(icon);
          prevPositions.set(props.id, [lat, lng]);
        } else if (dist > 0.0001) {
          animateMarker(marker, lat, lng, heading);
          prevPositions.set(props.id, [lat, lng]);
        }

        marker.setPopupContent(buildPopupContent(props));
      }
    });

    return () => {
      layer.clearLayers();
      markers.clear();
      prevPositions.clear();
    };
  }, [map, features, animateMarker]);

  return null;
}
