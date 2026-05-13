import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShipMarkers } from './ShipMarkers';
import { WeatherLayer } from './WeatherLayer';
import { CurrentLayer } from './CurrentLayer';
import { RouteLayer } from './RouteLayer';
import { useTheme } from '../../providers/ThemeProvider';
import { useStore } from '../../store/useStore';

const GLOBAL_CENTER: [number, number] = [15, 60];
const INITIAL_ZOOM = 3;
const MIN_ZOOM = 2;
const MAX_ZOOM = 12;

const GLOBAL_BOUNDS = L.latLngBounds(
  L.latLng(-60, -30),
  L.latLng(70, 150),
);

const LIGHT_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

function MapController() {
  const map = useMap();
  const followShip = useStore((s) => s.followShip);
  const ships = useStore((s) => s.ships);
  const prevFollowRef = useRef<string | null>(null);

  useEffect(() => {
    map.setMinZoom(MIN_ZOOM);
    map.setMaxZoom(MAX_ZOOM);
    map.setMaxBounds(GLOBAL_BOUNDS);
    map.options.maxBoundsViscosity = 1.0;
  }, [map]);

  useEffect(() => {
    if (followShip && followShip !== prevFollowRef.current) {
      prevFollowRef.current = followShip;
    }
  }, [followShip]);

  useEffect(() => {
    if (!followShip) {
      prevFollowRef.current = null;
      return;
    }

    const feature = ships?.features?.find((f) => {
      const props = f.properties as Record<string, unknown>;
      return props?.id === followShip;
    });

    if (feature && feature.geometry.type === 'Point') {
      const coords = feature.geometry.coordinates as number[];
      map.flyTo([coords[1], coords[0]], 6, {
        duration: 1.5,
        easeLinearity: 0.3,
      });
    }
  }, [followShip, ships, map]);

  useEffect(() => {
    if (followShip) {
      const feature = ships?.features?.find((f) => {
        const props = f.properties as Record<string, unknown>;
        return props?.id === followShip;
      });
      if (feature && feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates as number[];
        map.panTo([coords[1], coords[0]], { animate: true, duration: 1 });
      }
    }
  });

  return null;
}

export function MaritimeMap() {
  const { theme } = useTheme();
  const tiles = theme === 'dark' ? DARK_TILES : LIGHT_TILES;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border-2 border-black dark:border-blue-900/50 shadow-neobrutalist bg-[#0a1628] dark:bg-[#060d1a] relative">
      <MapContainer
        center={GLOBAL_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={GLOBAL_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        className="w-full h-full"
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution={tiles.attribution}
          url={tiles.url}
          key={theme}
        />
        <MapController />
        <ShipMarkers />
        <WeatherLayer />
        <CurrentLayer />
        <RouteLayer />
      </MapContainer>
    </div>
  );
}
