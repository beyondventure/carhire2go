import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Clock, Star, Navigation } from 'lucide-react';
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

// Mock location suggestions
const mockSuggestions: Location[] = [
  { lat: 6.4281, lng: 3.4219, address: 'Victoria Island, Lagos', name: 'Eko Hotel & Suites' },
  { lat: 6.4541, lng: 3.3947, address: 'Lekki Phase 1, Lagos', name: 'Lekki Toll Gate' },
  { lat: 6.5244, lng: 3.3792, address: 'Ikeja, Lagos', name: 'Murtala Muhammed Airport' },
  { lat: 6.4698, lng: 3.5852, address: 'Lekki, Lagos', name: 'Lekki Conservation Centre' },
  { lat: 6.4299, lng: 3.4155, address: 'Ikoyi, Lagos', name: 'Ikoyi Club 1938' },
  { lat: 6.5833, lng: 3.3500, address: 'Agege, Lagos', name: 'Computer Village' },
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = mockSuggestions.filter(
        loc => 
          loc.name?.toLowerCase().includes(query.toLowerCase()) ||
          loc.address.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(mockSuggestions.slice(0, 4));
    }
  }, [query]);

  const handleSelect = (location: Location) => {
    setQuery(location.name || location.address);
    onChange(location);
    setIsFocused(false);
  };

  const iconColor = type === 'pickup' ? 'text-success' : 'text-destructive';
  const dotColor = type === 'pickup' ? 'bg-success' : 'bg-destructive';

  return (
    <div className={cn('relative', className)}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      
      <div className="relative">
        <div className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full',
          dotColor
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-3.5 rounded-xl border bg-card text-foreground',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            'transition-all duration-200',
            isFocused ? 'border-accent ring-2 ring-accent/20' : 'border-border'
          )}
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <Navigation size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Recent Locations */}
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock size={12} />
                Recent Locations
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((location, index) => (
                <motion.button
                  key={`${location.lat}-${location.lng}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: index * 0.05 } }}
                  onClick={() => handleSelect(location)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <MapPin size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.address}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Use Current Location */}
            <div className="border-t border-border">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Navigation size={16} className="text-accent" />
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
