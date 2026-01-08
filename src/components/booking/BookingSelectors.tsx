import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Crown, Bus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VEHICLE_TYPES, BOOKING_TYPES, CURRENCY } from '@/lib/constants';
import type { VehicleType, BookingType } from '@/types';

interface BookingTypeSelectorProps {
  selected?: BookingType;
  onChange: (type: BookingType) => void;
}

export function BookingTypeSelector({ selected, onChange }: BookingTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Booking Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {BOOKING_TYPES.map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(type.value as BookingType)}
            className={cn(
              'relative p-3 rounded-xl border transition-all text-left',
              selected === type.value
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/30'
            )}
          >
            {selected === type.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
              >
                <Check size={12} className="text-white" />
              </motion.div>
            )}
            <p className="font-medium text-sm text-foreground">{type.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface VehicleTypeSelectorProps {
  selected?: VehicleType;
  onChange: (type: VehicleType) => void;
}

const vehicleIcons: Record<string, React.ReactNode> = {
  sedan: <Car size={24} />,
  suv: <Car size={24} />,
  luxury: <Crown size={24} />,
  van: <Bus size={24} />,
  bus: <Bus size={24} />,
};

const vehiclePrices: Record<string, string> = {
  sedan: `${CURRENCY}35K - 50K`,
  suv: `${CURRENCY}50K - 85K`,
  luxury: `${CURRENCY}100K - 200K`,
  van: `${CURRENCY}60K - 90K`,
  bus: `${CURRENCY}80K - 150K`,
};

export function VehicleTypeSelector({ selected, onChange }: VehicleTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Vehicle Preference
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
        {VEHICLE_TYPES.map((vehicle) => (
          <motion.button
            key={vehicle.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(vehicle.value as VehicleType)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center p-4 rounded-xl border min-w-[100px] transition-all',
              selected === vehicle.value
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/30'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors',
              selected === vehicle.value
                ? 'bg-accent text-white'
                : 'bg-muted text-muted-foreground'
            )}>
              {vehicleIcons[vehicle.value]}
            </div>
            <p className="text-sm font-medium text-foreground">{vehicle.label}</p>
            <p className="text-xs text-muted-foreground">{vehicle.seats} seats</p>
            <p className="text-xs text-accent font-medium mt-1">
              {vehiclePrices[vehicle.value]}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
