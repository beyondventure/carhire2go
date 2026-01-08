// Core Types for CarHire2Go Platform
// Designed for React Native compatibility

export type UserRole = 'consumer' | 'provider' | 'driver' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  placeId?: string;
}

export type BookingType = 'full-day' | 'half-day' | 'to-and-fro' | 'point-to-point' | 'event';
export type BookingStatus = 'pending' | 'matching' | 'matched' | 'negotiating' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
export type VehicleType = 'sedan' | 'suv' | 'luxury' | 'van' | 'bus';

export interface Vehicle {
  id: string;
  providerId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  seats: number;
  images: string[];
  available: boolean;
  assignedDriverId?: string;
  dailyRate: number;
  verified: boolean;
}

export interface Driver {
  id: string;
  providerId: string;
  user: User;
  licenseNumber: string;
  licenseExpiry: Date;
  verified: boolean;
  available: boolean;
  assignedVehicleId?: string;
  rating: number;
  totalTrips: number;
}

export interface Provider {
  id: string;
  user: User;
  businessName: string;
  businessAddress: string;
  serviceAreas: string[];
  verified: boolean;
  rating: number;
  totalBookings: number;
  acceptanceRate: number;
  responseTime: number; // in seconds
  vehicles: Vehicle[];
  drivers: Driver[];
  bankDetails?: BankDetails;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Booking {
  id: string;
  consumerId: string;
  consumer?: User;
  providerId?: string;
  provider?: Provider;
  driverId?: string;
  driver?: Driver;
  vehicleId?: string;
  vehicle?: Vehicle;
  
  pickup: Location;
  dropoff: Location;
  
  bookingType: BookingType;
  vehiclePreference?: VehicleType;
  scheduledDate: Date;
  scheduledTime: string;
  
  status: BookingStatus;
  
  estimatedPrice?: PriceRange;
  negotiatedPrice?: number;
  finalPrice?: number;
  
  matchingStartedAt?: Date;
  matchedAt?: Date;
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  createdAt: Date;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  type: 'text' | 'price-proposal' | 'price-accepted' | 'system';
  proposedPrice?: number;
  createdAt: Date;
}

export interface Settlement {
  id: string;
  providerId: string;
  provider?: Provider;
  bookingIds: string[];
  grossAmount: number;
  commission: number;
  gatewayFees: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export interface PlatformMetrics {
  totalBookings: number;
  activeBookings: number;
  totalGMV: number;
  platformRevenue: number;
  totalProviders: number;
  activeProviders: number;
  totalConsumers: number;
  activeConsumers: number;
  avgResponseTime: number;
  avgAcceptanceRate: number;
}

export interface ProviderMetrics {
  todayBookings: number;
  todayEarnings: number;
  pendingSettlement: number;
  totalEarnings: number;
  acceptanceRate: number;
  responseTime: number;
  fleetUtilization: number;
}

// Navigation Types for Role-based Routing
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

export interface RoleNavigation {
  consumer: NavItem[];
  provider: NavItem[];
  driver: NavItem[];
  admin: NavItem[];
}
