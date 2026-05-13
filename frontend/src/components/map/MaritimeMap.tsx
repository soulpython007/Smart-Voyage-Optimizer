import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShipMarkers } from './ShipMarkers';
import { WeatherLayer } from './WeatherLayer';
import { CurrentLayer } from './CurrentLayer';
import { RouteLayer } from './RouteLayer';
import { useTheme } from '../../providers/ThemeProvider';

const INDIAN_OCEAN_CENTER: [number, number] = [0, 72];
const INITIAL_ZOOM = 4;
const MIN_ZOOM = 3;
const MAX_ZOOM = 10;

const BOUNDS = L.latLngBounds(
  L.latLng(-15, 20),
  L.latLng(35, 115),
);

const LIGHT_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

function MapContent() {
  return (
    <>
      <ShipMarkers />
      <WeatherLayer />
      <CurrentLayer />
      <RouteLayer />
    </>
  );
}

let mapInstance: L.Map | null = null;
export function getMapInstance() {
  return mapInstance;
}

export function MaritimeMap() {
  const { theme } = useTheme();
  const tiles = theme === 'dark' ? DARK_TILES : LIGHT_TILES;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border-2 border-black dark:border-gray-600 shadow-neobrutalist bg-white dark:bg-gray-800">
      <MapContainer
        center={INDIAN_OCEAN_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={BOUNDS}
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
        <MapContent />
      </MapContainer>
    </div>
  );
}
