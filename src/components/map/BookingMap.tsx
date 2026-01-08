import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Icon, DivIcon, LatLngExpression, LatLngBounds } from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { MAP_CONFIG } from '@/lib/constants';
import type { Location } from '@/types';
import 'leaflet/dist/leaflet.css';

interface BookingMapProps {
  pickup?: Location;
  dropoff?: Location;
  providerLocations?: Array<{ id: string; lat: number; lng: number; available: boolean }>;
  showRoute?: boolean;
  onLocationSelect?: (location: Location) => void;
  interactive?: boolean;
  className?: string;
}

// Custom marker icons
const createCustomIcon = (type: 'pickup' | 'dropoff' | 'provider') => {
  const colors = {
    pickup: '#22c55e',
    dropoff: '#ef4444',
    provider: '#f59e0b',
  };

  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${colors[type]};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: 3px solid white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          ${type === 'provider' 
            ? '<rect x="3" y="8" width="18" height="8" rx="2"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/>'
            : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
          }
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

function MapController({ pickup, dropoff }: { pickup?: Location; dropoff?: Location }) {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = new LatLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 15);
    } else if (dropoff) {
      map.setView([dropoff.lat, dropoff.lng], 15);
    }
  }, [pickup, dropoff, map]);

  return null;
}

export function BookingMap({
  pickup,
  dropoff,
  providerLocations = [],
  showRoute = true,
  onLocationSelect,
  interactive = true,
  className,
}: BookingMapProps) {
  const routePositions: LatLngExpression[] = pickup && dropoff
    ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative rounded-xl overflow-hidden ${className}`}
    >
      <MapContainer
        center={[MAP_CONFIG.defaultCenter.lat, MAP_CONFIG.defaultCenter.lng]}
        zoom={MAP_CONFIG.defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapController pickup={pickup} dropoff={dropoff} />

        {pickup && (
          <Marker 
            position={[pickup.lat, pickup.lng]} 
            icon={createCustomIcon('pickup')}
          >
            <Popup>
              <div className="p-2">
                <p className="font-medium text-sm">Pickup</p>
                <p className="text-xs text-muted-foreground">{pickup.name || pickup.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker 
            position={[dropoff.lat, dropoff.lng]} 
            icon={createCustomIcon('dropoff')}
          >
            <Popup>
              <div className="p-2">
                <p className="font-medium text-sm">Drop-off</p>
                <p className="text-xs text-muted-foreground">{dropoff.name || dropoff.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {providerLocations.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.lat, provider.lng]}
            icon={createCustomIcon('provider')}
          >
            <Popup>
              <div className="p-2">
                <p className="font-medium text-sm">Available Provider</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {showRoute && routePositions.length === 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: 'hsl(175, 84%, 40%)',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 glass-card p-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span>Drop-off</span>
        </div>
        {providerLocations.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Providers</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
