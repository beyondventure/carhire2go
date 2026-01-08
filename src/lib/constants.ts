// Platform Constants
export const PLATFORM_NAME = 'CarHire2Go';
export const PLATFORM_TAGLINE = 'Premium Car Hire, Simplified';
export const COMMISSION_RATE = 0.10; // 10%
export const MATCHING_TIMEOUT = 60; // seconds
export const CURRENCY = '₦';
export const CURRENCY_CODE = 'NGN';

// Booking Types
export const BOOKING_TYPES = [
  { value: 'full-day', label: 'Full Day', description: 'Hire for entire day' },
  { value: 'half-day', label: 'Half Day', description: '6 hours or less' },
  { value: 'to-and-fro', label: 'To & Fro', description: 'Round trip' },
  { value: 'point-to-point', label: 'Point to Point', description: 'One-way drop' },
  { value: 'event', label: 'Event', description: 'Wedding, party, etc.' },
] as const;

// Vehicle Types
export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', icon: 'Car', seats: '4' },
  { value: 'suv', label: 'SUV', icon: 'Car', seats: '5-7' },
  { value: 'luxury', label: 'Luxury', icon: 'Crown', seats: '4' },
  { value: 'van', label: 'Van', icon: 'Bus', seats: '7-12' },
  { value: 'bus', label: 'Bus', icon: 'Bus', seats: '15+' },
] as const;

// Status Labels
export const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  matching: 'Finding Provider',
  matched: 'Provider Found',
  negotiating: 'Negotiating',
  confirmed: 'Confirmed',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

// Booking Type Labels
export const BOOKING_TYPE_LABELS: Record<string, string> = {
  'full-day': 'Full Day',
  'half-day': 'Half Day',
  'to-and-fro': 'To & Fro',
  'point-to-point': 'Point to Point',
  'event': 'Event',
};

// Nigerian Cities (Major Service Areas)
export const SERVICE_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Kaduna',
  'Benin City',
  'Enugu',
  'Calabar',
  'Warri',
];

// Map Configuration
export const MAP_CONFIG = {
  defaultCenter: { lat: 6.5244, lng: 3.3792 }, // Lagos
  defaultZoom: 13,
  maxZoom: 18,
  minZoom: 5,
};
