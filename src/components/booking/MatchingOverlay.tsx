import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Car, Clock, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATCHING_TIMEOUT } from '@/lib/constants';

interface MatchedProvider {
  id: string;
  name: string;
  rating: number;
  distance: string;
  vehicle: string;
}

interface MatchingOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onMatched?: (provider: MatchedProvider) => void;
}

export function MatchingOverlay({ isVisible, onClose, onMatched }: MatchingOverlayProps) {
  const [countdown, setCountdown] = useState(MATCHING_TIMEOUT);
  const [status, setStatus] = useState<'searching' | 'found' | 'timeout'>('searching');
  const [matchedProvider, setMatchedProvider] = useState<MatchedProvider | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(MATCHING_TIMEOUT);
      setStatus('searching');
      setMatchedProvider(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate finding a provider after 5 seconds
    const matchTimer = setTimeout(() => {
      setStatus('found');
      setMatchedProvider({
        id: 'provider1',
        name: 'FleetMaster Nigeria',
        rating: 4.7,
        distance: '2.3 km',
        vehicle: 'Toyota Camry 2022',
      });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [isVisible]);

  const circumference = 2 * Math.PI * 45;
  const progress = ((MATCHING_TIMEOUT - countdown) / MATCHING_TIMEOUT) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-8 max-w-md w-full text-center"
          >
            {status === 'searching' && (
              <>
                {/* Countdown Ring */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground tabular-nums">
                      {countdown}
                    </span>
                  </div>
                </div>

                {/* Animated Search Icon */}
                <div className="relative mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center"
                  >
                    <Search size={28} className="text-accent" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-accent/20"
                  />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Finding your provider
                </h3>
                <p className="text-muted-foreground mb-6">
                  Searching for available providers near you...
                </p>

                <button
                  onClick={onClose}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
              </>
            )}

            {status === 'found' && matchedProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <Check size={32} className="text-success" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Provider Found!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your request has been accepted
                </p>

                {/* Provider Card */}
                <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Car size={24} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{matchedProvider.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={14} className="text-warning fill-warning" />
                        <span className="text-sm text-foreground">{matchedProvider.rating}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{matchedProvider.distance}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {matchedProvider.vehicle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onMatched?.(matchedProvider)}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
