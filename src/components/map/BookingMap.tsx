import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { MAP_CONFIG } from '@/lib/constants';
import type { Location } from '@/types';

interface BookingMapProps {
  pickup?: Location;
  dropoff?: Location;
  providerLocations?: Array<{ id: string; lat: number; lng: number; available: boolean }>;
  showRoute?: boolean;
  onLocationSelect?: (location: Location) => void;
  interactive?: boolean;
  className?: string;
}

// Placeholder map component while loading or as fallback
function MapPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-muted ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    </div>
  );
}

// Static map display without react-leaflet to avoid context issues
export function BookingMap({
  pickup,
  dropoff,
  providerLocations = [],
  showRoute = true,
  onLocationSelect,
  interactive = true,
  className,
}: BookingMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Delay to allow React to fully mount
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Use a static map image as fallback to avoid react-leaflet context issues
  const center = pickup 
    ? `${pickup.lat},${pickup.lng}` 
    : `${MAP_CONFIG.defaultCenter.lat},${MAP_CONFIG.defaultCenter.lng}`;
  
  const markers = [
    pickup && `color:green|${pickup.lat},${pickup.lng}`,
    dropoff && `color:red|${dropoff.lat},${dropoff.lng}`,
    ...providerLocations.map(p => `color:orange|${p.lat},${p.lng}`)
  ].filter(Boolean).join('&markers=');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative rounded-xl overflow-hidden bg-slate-100 ${className}`}
    >
      {/* Interactive Map Visualization */}
      <div className="h-full w-full relative">
        {/* Map background - using OpenStreetMap static tiles */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${MAP_CONFIG.defaultCenter.lng},${MAP_CONFIG.defaultCenter.lat},12,0/800x600?access_token=pk.placeholder)`,
            backgroundColor: '#e5e7eb',
          }}
        />
        
        {/* Map Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 to-slate-300/50">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
        </div>

        {/* Location Markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Pickup marker */}
            {pickup && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-full"
              >
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin size={16} className="text-white" />
                </div>
                <div className="w-2 h-2 bg-success rounded-full mx-auto -mt-1" />
              </motion.div>
            )}

            {/* Dropoff marker */}
            {dropoff && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute right-1/4 bottom-1/3 -translate-x-1/2 -translate-y-full"
              >
                <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin size={16} className="text-white" />
                </div>
                <div className="w-2 h-2 bg-destructive rounded-full mx-auto -mt-1" />
              </motion.div>
            )}

            {/* Route line */}
            {pickup && dropoff && showRoute && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.line
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  x1="25%"
                  y1="33%"
                  x2="75%"
                  y2="67%"
                  stroke="hsl(175, 84%, 40%)"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Provider markers */}
            {providerLocations.slice(0, 3).map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="absolute"
                style={{
                  left: `${30 + index * 20}%`,
                  top: `${50 + (index % 2) * 15}%`,
                }}
              >
                <div className={`w-6 h-6 ${provider.available ? 'bg-warning' : 'bg-muted-foreground'} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center marker when no locations */}
        {!pickup && !dropoff && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MapPin size={32} className="text-accent drop-shadow-lg" />
            </motion.div>
          </div>
        )}
      </div>

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

      {/* Interactive hint */}
      <div className="absolute top-4 right-4 glass-card px-3 py-1.5 text-xs text-muted-foreground">
        📍 Lagos, Nigeria
      </div>
    </motion.div>
  );
}
