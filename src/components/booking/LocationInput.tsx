import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Location } from '@/types';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value?: Location;
  onChange: (location: Location) => void;
  type: 'pickup' | 'dropoff';
  className?: string;
}

const recentLocations: Location[] = [
  { lat: 6.4281, lng: 3.4219, address: 'Victoria Island, Lagos', name: 'Eko Hotel & Suites' },
  { lat: 6.5244, lng: 3.3792, address: 'Ikeja, Lagos', name: 'Murtala Muhammed Airport' },
  { lat: 6.4541, lng: 3.3947, address: 'Lekki Phase 1, Lagos', name: 'Lekki Toll Gate' },
];

export function LocationInput({
  label,
  placeholder,
  value,
  onChange,
  type,
  className,
}: LocationInputProps) {
  const [query, setQuery] = useState(value?.name || value?.address || '');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery + ', Nigeria',
          format: 'json',
          addressdetails: '1',
          limit: '10',
          countrycodes: 'ng',
          viewbox: '2.6,4.2,14.7,13.9',
          bounded: '1',
          dedupe: '1',
        }),
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const results: Location[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        name: item.name || item.display_name.split(',')[0],
      }));
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => searchPlaces(query), 400);
    } else {
      setSuggestions([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchPlaces]);

  const handleSelect = (location: Location) => {
    setQuery(location.name || location.address);
    onChange(location);
    setIsFocused(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const loc: Location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: data.display_name || 'Current Location',
            name: data.name || data.display_name?.split(',')[0] || 'Current Location',
          };
          setQuery(loc.name || loc.address);
          onChange(loc);
          setIsFocused(false);
        } catch {
          /* ignore */
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const dotColor = type === 'pickup' ? 'bg-success' : 'bg-destructive';
  const showRecent = isFocused && query.length < 2 && suggestions.length === 0;
  const showResults = isFocused && (suggestions.length > 0 || isLoading || showRecent);

  return (
    <div className={cn('relative', className)}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      <div className="relative">
        <div className={cn('absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full', dotColor)} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 250)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-3.5 rounded-xl border bg-card text-foreground',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            'transition-all duration-200',
            isFocused ? 'border-accent ring-2 ring-accent/20' : 'border-border'
          )}
        />

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {isLocating ? (
            <Loader2 size={18} className="text-muted-foreground animate-spin" />
          ) : (
            <Navigation size={18} className="text-muted-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Searching places...</span>
              </div>
            )}

            {showRecent && (
              <>
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock size={12} />
                    Recent Locations
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {recentLocations.map((location, index) => (
                    <motion.button
                      key={`recent-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: index * 0.05 } }}
                      onClick={() => handleSelect(location)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <Clock size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.address}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {!isLoading && suggestions.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                {suggestions.map((location, index) => (
                  <motion.button
                    key={`${location.lat}-${location.lng}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: index * 0.04 } }}
                    onClick={() => handleSelect(location)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{location.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{location.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No places found for "{query}"
              </div>
            )}

            {/* Use Current Location */}
            <div className="border-t border-border">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  {isLocating ? (
                    <Loader2 size={16} className="text-accent animate-spin" />
                  ) : (
                    <Navigation size={16} className="text-accent" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Use current location</p>
                  <p className="text-xs text-muted-foreground">Find places near you</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
