import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { MAP_CONFIG } from '@/lib/constants';
import type { Location } from '@/types';
import L from 'leaflet';
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

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const pickupIcon = createCustomIcon('#22c55e'); // green
const dropoffIcon = createCustomIcon('#ef4444'); // red
const providerAvailableIcon = createCustomIcon('#f59e0b'); // amber/warning
const providerUnavailableIcon = createCustomIcon('#6b7280'); // gray

export function BookingMap({
  pickup,
  dropoff,
  providerLocations = [],
  showRoute = true,
  onLocationSelect,
  interactive = true,
  className,
}: BookingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [MAP_CONFIG.defaultCenter.lat, MAP_CONFIG.defaultCenter.lng],
      zoom: MAP_CONFIG.defaultZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Use a clean, desaturated map style (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Handle click for location selection
    if (interactive && onLocationSelect) {
      map.on('click', (e) => {
        onLocationSelect({
          address: `Location at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      });
    }

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive, onLocationSelect]);

  // Update markers and route when locations change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear existing route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const bounds: L.LatLngBounds | null = L.latLngBounds([]);

    // Add pickup marker
    if (pickup) {
      const marker = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<strong>Pickup</strong><br/>${pickup.address || 'Pickup location'}`);
      markersRef.current.push(marker);
      bounds.extend([pickup.lat, pickup.lng]);
    }

    // Add dropoff marker
    if (dropoff) {
      const marker = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(`<strong>Drop-off</strong><br/>${dropoff.address || 'Drop-off location'}`);
      markersRef.current.push(marker);
      bounds.extend([dropoff.lat, dropoff.lng]);
    }

    // Add provider markers
    providerLocations.forEach((provider) => {
      const icon = provider.available ? providerAvailableIcon : providerUnavailableIcon;
      const marker = L.marker([provider.lat, provider.lng], { icon })
        .addTo(map)
        .bindPopup(`Provider ${provider.id}<br/>${provider.available ? 'Available' : 'Busy'}`);
      markersRef.current.push(marker);
      bounds.extend([provider.lat, provider.lng]);
    });

    // Draw route line between pickup and dropoff
    if (pickup && dropoff && showRoute) {
      routeLineRef.current = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        {
          color: '#14b8a6', // teal accent
          weight: 4,
          dashArray: '10, 6',
          opacity: 0.8,
        }
      ).addTo(map);
    }

    // Fit map to bounds if we have markers
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [pickup, dropoff, providerLocations, showRoute, isMapReady]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative rounded-xl overflow-hidden ${className}`}
    >
      {/* Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="h-full w-full min-h-[300px]"
        style={{ background: '#f1f5f9' }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Drop-off</span>
        </div>
        {providerLocations.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Providers</span>
          </div>
        )}
      </div>

      {/* Location indicator */}
      <div className="absolute top-4 right-4 z-[1000] glass-card px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
        <Navigation size={12} className="text-accent" />
        Lagos, Nigeria
      </div>

      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-[1001]">
          <div className="text-center">
            <MapPin size={48} className="text-muted-foreground mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
