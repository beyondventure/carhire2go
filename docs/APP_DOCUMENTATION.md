# RideConnect Nigeria - Complete App Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [User Roles](#user-roles)
4. [Authentication Flow](#authentication-flow)
5. [Database Schema](#database-schema)
6. [Features by Role](#features-by-role)
7. [UI Components](#ui-components)
8. [Page Structure](#page-structure)
9. [Mobile Compatibility](#mobile-compatibility)
10. [API & Data Flow](#api--data-flow)

---

## Overview

RideConnect Nigeria is a ride-hailing and vehicle rental platform connecting consumers with transport providers and drivers across Nigeria. The app supports multiple user roles with distinct dashboards and functionality.

### Key Features
- **Multi-role system**: Consumer, Provider, Driver, Admin
- **Booking types**: Full-day, Half-day, To-and-Fro, Point-to-Point, Event
- **Vehicle types**: Sedan, SUV, Luxury, Van, Bus
- **Price negotiation**: Real-time chat-based negotiation between consumers and providers
- **Real-time updates**: Live booking status changes via Supabase Realtime
- **Verification system**: NIN and CAC verification for providers/drivers
- **Currency**: Nigerian Naira (₦)

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Maps**: React Leaflet

### Backend (Supabase/Lovable Cloud)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Edge Functions**: Deno-based serverless functions
- **Storage**: Supabase Storage for file uploads

### Mobile Compatibility
- Platform utility layer (`src/lib/platform.ts`) abstracts browser APIs
- Responsive design with mobile-first approach
- Touch-friendly UI components
- Native-compatible patterns (no direct DOM manipulation where possible)

---

## User Roles

### 1. Consumer (`consumer`)
Regular users who book rides and vehicles.

**Capabilities:**
- Create bookings
- View and manage their bookings
- Chat with providers
- Negotiate prices
- View payment history
- Manage profile and saved locations

### 2. Provider (`provider`)
Fleet owners or individual vehicle owners.

**Capabilities:**
- Accept/decline booking requests
- Manage fleet (vehicles)
- Manage drivers
- View earnings and analytics
- Negotiate prices with consumers
- Assign drivers to bookings

### 3. Driver (`driver`)
Assigned to providers, execute trips.

**Capabilities:**
- View assigned trips
- Start/complete trips
- View earnings
- Manage availability status
- Update profile

### 4. Admin (`admin`)
Platform administrators.

**Capabilities:**
- View all bookings, providers, consumers
- Verify providers and drivers
- Manage settlements
- View platform analytics
- System configuration

---

## Authentication Flow

### Registration (`/register`)
1. User enters email, password, full name, phone
2. Selects role: Consumer, Provider, or Driver
3. Account created with auto-confirm enabled
4. Profile and user_role records created
5. Redirects based on role:
   - Consumer → `/consumer`
   - Provider → `/onboarding/provider`
   - Driver → `/onboarding/driver`

### Login (`/login`)
1. Email/password authentication
2. Fetches user profile and roles
3. Redirects to appropriate dashboard

### Onboarding
**Provider Onboarding** (`/onboarding/provider`):
- Business name
- Provider type (Individual/Company)
- Business address
- CAC number (for companies)
- NIN number
- Service areas

**Driver Onboarding** (`/onboarding/driver`):
- License number
- License expiry date
- NIN number
- Provider association (optional)

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches auth.user.id) |
| email | TEXT | User email |
| name | TEXT | Full name |
| phone | TEXT | Phone number |
| avatar_url | TEXT | Profile image URL |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

#### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| role | app_role | consumer, provider, driver, admin |
| created_at | TIMESTAMP | Creation time |

#### `providers`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| business_name | TEXT | Business name |
| provider_type | provider_type | individual, company |
| business_address | TEXT | Address |
| cac_number | TEXT | CAC registration |
| cac_verified | BOOLEAN | CAC verification status |
| nin_number | TEXT | National ID |
| nin_verified | BOOLEAN | NIN verification status |
| verification_status | verification_status | pending, under_review, approved, rejected |
| allows_negotiation | BOOLEAN | Price negotiation enabled |
| service_areas | TEXT[] | Service coverage areas |
| rating | NUMERIC | Average rating |
| total_bookings | INTEGER | Booking count |
| acceptance_rate | NUMERIC | Request acceptance % |
| bank_name | TEXT | Bank for payouts |
| account_number | TEXT | Bank account |
| account_name | TEXT | Account holder name |

#### `drivers`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| provider_id | UUID | References providers |
| license_number | TEXT | Driver's license |
| license_expiry | DATE | License expiration |
| nin_number | TEXT | National ID |
| nin_verified | BOOLEAN | NIN verification status |
| verification_status | verification_status | pending, under_review, approved, rejected |
| assigned_vehicle_id | UUID | Currently assigned vehicle |
| available | BOOLEAN | Availability status |
| rating | NUMERIC | Average rating |
| total_trips | INTEGER | Completed trips count |

#### `vehicles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| provider_id | UUID | References providers |
| make | TEXT | Vehicle make |
| model | TEXT | Vehicle model |
| year | INTEGER | Year of manufacture |
| color | TEXT | Vehicle color |
| plate_number | TEXT | License plate |
| vehicle_type | vehicle_type | sedan, suv, luxury, van, bus |
| seats | INTEGER | Passenger capacity |
| daily_rate | NUMERIC | Base daily rate |
| available | BOOLEAN | Availability status |
| verified | BOOLEAN | Verification status |
| assigned_driver_id | UUID | References drivers |
| images | TEXT[] | Vehicle image URLs |

#### `bookings`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| consumer_id | UUID | References auth.users |
| provider_id | UUID | References providers |
| driver_id | UUID | References drivers |
| vehicle_id | UUID | References vehicles |
| booking_type | booking_type | full-day, half-day, to-and-fro, point-to-point, event |
| vehicle_preference | vehicle_type | Preferred vehicle type |
| pickup_address | TEXT | Pickup location |
| pickup_name | TEXT | Pickup location name |
| pickup_lat | NUMERIC | Pickup latitude |
| pickup_lng | NUMERIC | Pickup longitude |
| dropoff_address | TEXT | Dropoff location |
| dropoff_name | TEXT | Dropoff location name |
| dropoff_lat | NUMERIC | Dropoff latitude |
| dropoff_lng | NUMERIC | Dropoff longitude |
| scheduled_date | DATE | Booking date |
| scheduled_time | TIME | Booking time |
| status | booking_status | See status flow below |
| estimated_min_price | NUMERIC | Minimum price estimate |
| estimated_max_price | NUMERIC | Maximum price estimate |
| negotiated_price | NUMERIC | Agreed negotiated price |
| final_price | NUMERIC | Final confirmed price |
| matching_started_at | TIMESTAMP | When matching began |
| matched_at | TIMESTAMP | When provider matched |
| confirmed_at | TIMESTAMP | When booking confirmed |
| started_at | TIMESTAMP | When trip started |
| completed_at | TIMESTAMP | When trip completed |
| cancelled_at | TIMESTAMP | When cancelled |

**Booking Status Flow:**
```
pending → matching → matched → negotiating → confirmed → in-progress → completed
                                    ↓                         ↓
                               cancelled                  cancelled
```

#### `chat_messages`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | References bookings |
| sender_id | UUID | References auth.users |
| sender_role | app_role | Sender's role |
| message_type | TEXT | text, price_proposal, price_accepted |
| content | TEXT | Message content |
| proposed_price | NUMERIC | Price for proposals |
| created_at | TIMESTAMP | Message time |

---

## Features by Role

### Consumer Features

#### Home Dashboard (`/consumer`)
- Welcome message with user name
- Quick booking CTA card
- Statistics (total trips, active bookings)
- Active booking status
- Recent bookings list

#### New Booking (`/consumer/book`)
- Interactive map for location selection
- Pickup/dropoff location inputs with autocomplete
- Booking type selector (Full-day, Half-day, etc.)
- Vehicle type selector
- Date and time pickers
- Price estimation display
- Matching overlay during provider search
- Negotiation overlay for price discussions

#### My Bookings (`/consumer/bookings`)
- Filter tabs: All, Active, Completed, Cancelled
- Search functionality
- Booking cards with:
  - Status badge
  - Route information
  - Price display
  - Negotiation indicator
  - Chat access

#### Payments (`/consumer/payments`)
- Total spent metrics
- Pending payments
- Monthly spending
- Payment history list
- Payment methods management
- Quick actions (invoices, receipts)

#### Profile (`/consumer/profile`)
- Edit personal info (name, phone)
- Saved locations
- Notification settings
- Account verification status
- Sign out and account deletion

### Provider Features

#### Dashboard (`/provider`)
- Metrics: Today's bookings, earnings, acceptance rate
- Incoming requests with accept/decline actions
- Fleet status overview
- Driver availability
- Recent bookings table

#### Requests (`/provider/requests`)
- Pending booking requests
- Request details (route, type, price range)
- Accept/decline functionality
- Chat with consumers
- Price negotiation interface

#### Fleet Management (`/provider/fleet`)
- Add new vehicles
- Vehicle list with status
- Vehicle details (make, model, plate, type)
- Assign/unassign drivers
- Vehicle availability toggle

#### Driver Management (`/provider/drivers`)
- Add drivers (existing or new)
- Driver list with status
- Assign vehicles to drivers
- View driver performance

#### Earnings (`/provider/earnings`)
- Today's earnings
- Weekly earnings chart
- Transaction history
- Payout information

#### Settings (`/provider/settings`)
- Business information
- Payment settings (bank details)
- Notification preferences
- Verification documents

### Driver Features

#### Home (`/driver`)
- Active trip display with map
- Trip details (pickup/dropoff)
- Start/Complete trip buttons
- Online/offline status toggle
- No trip message when idle

#### Active Trip (`/driver/trip`)
- Full-screen map view
- Navigation to pickup/dropoff
- Customer contact button
- Trip progress indicators
- Complete trip action

#### Trip History (`/driver/trips`)
- Filter by status
- Trip cards with details
- Earnings per trip
- Date/time information

#### Earnings (`/driver/earnings`)
- Today's earnings
- Weekly breakdown
- Transaction list
- Export to CSV

#### Profile (`/driver/profile`)
- Personal information
- License details
- Assigned vehicle info
- Notification settings
- Availability toggle

### Admin Features

#### Dashboard (`/admin`)
- Platform-wide metrics
- Active providers count
- Total bookings
- Revenue overview
- Recent activity

#### Bookings (`/admin/bookings`)
- All platform bookings
- Filter and search
- Booking details view
- Status management

#### Providers (`/admin/providers`)
- All registered providers
- Verification status
- Provider details
- Actions (approve, suspend)

#### Consumers (`/admin/consumers`)
- All registered consumers
- Booking history
- Contact actions

#### Verification (`/admin/verification`)
- Pending verifications queue
- Document review
- Approve/reject actions

#### Settlements (`/admin/settlements`)
- Payment settlements
- Provider payouts
- Transaction records

#### Analytics (`/admin/analytics`)
- Booking trends charts
- Revenue charts
- User growth
- Geographic distribution

#### Settings (`/admin/settings`)
- Platform configuration
- Commission rates
- Service areas

---

## UI Components

### Design System

#### Color Tokens (HSL format)
```css
--background: 240 10% 3.9%        /* Dark background */
--foreground: 0 0% 98%            /* Light text */
--card: 240 10% 3.9%              /* Card background */
--primary: 0 0% 98%               /* Primary actions */
--secondary: 240 3.7% 15.9%       /* Secondary elements */
--muted: 240 3.7% 15.9%           /* Muted text/bg */
--accent: 240 4.8% 95.9%          /* Accent highlights */
--destructive: 0 62.8% 30.6%      /* Error/danger */
--success: 142 76% 36%            /* Success states */
--warning: 45 93% 47%             /* Warning states */
```

#### Typography
- Font Family: System fonts, sans-serif
- Headings: Bold weights (600-700)
- Body: Regular weight (400)
- Sizes: text-xs through text-4xl

### Core Components

#### Layout Components
- `DashboardLayout`: Main layout wrapper with sidebar/header
- `DashboardSkeleton`: Loading skeleton for dashboards
- `Sidebar`: Navigation sidebar (desktop)
- `MobileNav`: Bottom navigation (mobile)
- `Header`: Top header with user info

#### UI Primitives (shadcn/ui)
- `Button`: Multiple variants (default, secondary, ghost, etc.)
- `Card`: Container component
- `Dialog`: Modal dialogs
- `Input`: Text inputs
- `Select`: Dropdown selects
- `Tabs`: Tab navigation
- `Badge`: Status badges
- `Toast/Sonner`: Notifications
- `Skeleton`: Loading placeholders

#### Custom Components
- `MetricCard`: Dashboard metric display
- `StatusBadge`: Booking/status indicators
- `BookingMap`: Leaflet map integration
- `ChatDialog`: Chat interface for negotiations
- `LocationInput`: Address autocomplete
- `MatchingOverlay`: Provider matching animation
- `NegotiationOverlay`: Price negotiation interface

### Animation Patterns
Using Framer Motion:
```tsx
// Page entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Staggered lists
transition={{ delay: index * 0.1 }}

// Button interactions
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

---

## Page Structure

### Route Map

```
/                           → LandingPage
/login                      → Login
/register                   → Register
/sitemap                    → Sitemap

/onboarding/provider        → ProviderOnboarding
/onboarding/driver          → DriverOnboarding

/consumer                   → ConsumerHome
/consumer/book              → ConsumerBooking
/consumer/bookings          → ConsumerBookings
/consumer/payments          → ConsumerPayments
/consumer/profile           → ConsumerProfile

/provider                   → ProviderDashboard
/provider/requests          → ProviderRequests
/provider/fleet             → ProviderFleet
/provider/drivers           → ProviderDrivers
/provider/earnings          → ProviderEarnings
/provider/settings          → ProviderSettings

/driver                     → DriverHome
/driver/trip                → DriverTrip
/driver/trips               → DriverTrips
/driver/earnings            → DriverEarnings
/driver/profile             → DriverProfile

/admin                      → AdminDashboard
/admin/bookings             → AdminBookings
/admin/providers            → AdminProviders
/admin/consumers            → AdminConsumers
/admin/settlements          → AdminSettlements
/admin/analytics            → AdminAnalytics
/admin/verification         → AdminVerification
/admin/settings             → AdminSettings

/architecture               → SystemArchitecture
```

---

## Mobile Compatibility

### Platform Abstraction Layer
Located in `src/lib/platform.ts`:

```typescript
// Environment detection
isBrowser: boolean
isReactNative: boolean

// URL handling
getOrigin(): string

// Storage abstraction (localStorage → AsyncStorage)
storage: {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// Native actions
openExternalUrl(url: string): void
openEmail(email: string, subject?: string, body?: string): void
openPhone(phone: string): void

// File operations
downloadFile(content: string, filename: string, mimeType?: string): void

// Screen utilities
getScreenDimensions(): { width: number, height: number }
isMobileViewport(): boolean

// Event abstraction
onScroll(callback: (scrollY: number) => void): () => void
```

### Mobile UI Considerations
1. **Bottom Navigation**: MobileNav component for thumb-friendly navigation
2. **Touch Targets**: Minimum 44px touch targets
3. **Responsive Grid**: Mobile-first with lg: breakpoint for desktop
4. **Safe Areas**: Padding for notches and bottom bars (pb-20 on mobile)
5. **Swipe Gestures**: Framer Motion for swipe interactions

### React Native Conversion Notes
When converting with Emergent:

1. **Replace** Leaflet maps with react-native-maps
2. **Replace** HTML inputs with React Native TextInput
3. **Update** platform.ts implementations for RN
4. **Convert** Tailwind classes to StyleSheet objects or NativeWind
5. **Replace** react-router-dom with React Navigation
6. **Update** Supabase client for React Native

---

## API & Data Flow

### Custom Hooks

#### `useSupabaseAuth`
Manages authentication state:
- `user`: Current auth user
- `profile`: User profile data
- `roles`: User roles array
- `isLoading`: Auth loading state
- `signIn()`, `signUp()`, `signOut()`: Auth actions

#### `useBookings`
Manages booking data:
- `bookings`: All accessible bookings
- `isLoading`: Loading state
- `createBooking()`: Create new booking
- `updateBooking()`: Update booking
- `acceptBooking()`: Provider accepts booking
- `cancelBooking()`: Cancel booking

#### `useProviders`
Manages provider data:
- `provider`: Current user's provider profile
- `allProviders`: All providers (admin)
- `isLoading`: Loading state
- `createProvider()`: Create provider profile
- `updateProvider()`: Update provider

#### `useDrivers`
Manages driver data:
- `driver`: Current user's driver profile
- `allDrivers`: All drivers
- `isLoading`: Loading state
- `createDriver()`: Create driver profile
- `updateDriver()`: Update driver

#### `useVehicles`
Manages vehicle data:
- `vehicles`: Provider's vehicles
- `isLoading`: Loading state
- `addVehicle()`: Add new vehicle
- `updateVehicle()`: Update vehicle

#### `useChat`
Manages chat/negotiation:
- `messages`: Chat messages
- `sendMessage()`: Send text message
- `proposePrice()`: Send price proposal
- `acceptPrice()`: Accept proposed price

### Real-time Subscriptions
Bookings table has real-time enabled for:
- New booking notifications
- Status change updates
- Price negotiation updates

```typescript
supabase
  .channel('bookings')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, handler)
  .subscribe()
```

---

## Constants

### Currency
```typescript
export const CURRENCY = '₦';  // Nigerian Naira
```

### Booking Types
```typescript
['full-day', 'half-day', 'to-and-fro', 'point-to-point', 'event']
```

### Vehicle Types
```typescript
['sedan', 'suv', 'luxury', 'van', 'bus']
```

### Booking Statuses
```typescript
['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress', 'completed', 'cancelled']
```

### Verification Statuses
```typescript
['pending', 'under_review', 'approved', 'rejected']
```

---

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Users can only access their own data
- Providers can access their bookings and drivers
- Drivers can access their assigned trips
- Admins have full access

### Authentication
- Email/password authentication
- Auto-confirm enabled for faster onboarding
- Session-based auth with secure tokens

---

## File Structure

```
src/
├── assets/                 # Images and static assets
├── components/
│   ├── analytics/          # Chart components
│   ├── booking/            # Booking-related components
│   ├── chat/               # Chat components
│   ├── landing/            # Landing page sections
│   ├── layout/             # Layout components
│   ├── map/                # Map components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── integrations/
│   └── supabase/           # Supabase client and types
├── lib/                    # Utilities and constants
├── pages/
│   ├── admin/              # Admin pages
│   ├── auth/               # Auth pages
│   ├── consumer/           # Consumer pages
│   ├── driver/             # Driver pages
│   ├── onboarding/         # Onboarding pages
│   └── provider/           # Provider pages
└── types/                  # TypeScript types
```

---

## Deployment

### Frontend
- Hosted on Lovable (lovable.app subdomain)
- Can connect custom domain
- Auto-deploys on code changes

### Backend
- Lovable Cloud (Supabase)
- Edge functions auto-deploy
- Database migrations via Lovable

---

*Documentation generated for RideConnect Nigeria v1.0*
*Last updated: January 2026*
