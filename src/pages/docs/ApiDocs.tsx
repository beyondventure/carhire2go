import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Table, Shield, Key, Code, Copy, Check, ChevronDown, ChevronRight,
  Globe, Lock, ArrowLeft, Server, Zap, BookOpen, FileJson, Users, Car, 
  CreditCard, Bell, MessageSquare, UserCheck, Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// ─── Data Definitions ────────────────────────────────────────────────
const API_BASE_URL = 'https://<project-ref>.supabase.co';
const ANON_KEY = '<supabase-publishable-or-anon-key>';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  description?: string;
}

interface RlsPolicy {
  name: string;
  command: string;
  description: string;
}

interface TableDef {
  name: string;
  icon: React.ReactNode;
  description: string;
  columns: Column[];
  rlsPolicies: RlsPolicy[];
  notes?: string[];
}

const enums = [
  { name: 'app_role', values: ['consumer', 'provider', 'driver', 'admin'] },
  { name: 'booking_status', values: ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress', 'completed', 'cancelled'] },
  { name: 'booking_type', values: ['full-day', 'half-day', 'to-and-fro', 'point-to-point', 'event'] },
  { name: 'provider_type', values: ['individual', 'company'] },
  { name: 'vehicle_type', values: ['sedan', 'suv', 'luxury', 'van', 'bus'] },
  { name: 'verification_status', values: ['pending', 'under_review', 'approved', 'rejected'] },
];

const tables: TableDef[] = [
  {
    name: 'profiles',
    icon: <Users size={18} />,
    description: 'User profile data, auto-created on signup via trigger.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'auth.users.id', description: 'References auth.users' },
      { name: 'email', type: 'text', nullable: false, default: null },
      { name: 'name', type: 'text', nullable: false, default: null },
      { name: 'phone', type: 'text', nullable: true, default: null },
      { name: 'avatar_url', type: 'text', nullable: true, default: null },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Users can view their own profile', command: 'SELECT', description: 'auth.uid() = id' },
      { name: 'Users can update their own profile', command: 'UPDATE', description: 'auth.uid() = id' },
      { name: 'Users can insert their own profile', command: 'INSERT', description: 'auth.uid() = id' },
      { name: 'Admins can view all profiles', command: 'SELECT', description: 'has_role(auth.uid(), \'admin\')' },
      { name: 'Providers can view consumer profiles for their bookings', command: 'SELECT', description: 'Consumer is linked via booking to provider' },
    ],
    notes: ['Auto-created by handle_new_user() trigger on auth.users insert', 'No DELETE allowed'],
  },
  {
    name: 'user_roles',
    icon: <UserCheck size={18} />,
    description: 'Maps users to their application roles.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null, description: 'References auth.users' },
      { name: 'role', type: 'app_role', nullable: false, default: null },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Users can view their own roles', command: 'SELECT', description: 'auth.uid() = user_id' },
      { name: 'Users can insert their own role', command: 'INSERT', description: 'auth.uid() = user_id' },
      { name: 'Admins can manage all roles', command: 'ALL', description: 'has_role(auth.uid(), \'admin\')' },
    ],
  },
  {
    name: 'providers',
    icon: <Server size={18} />,
    description: 'Provider profiles with verification, business info, and bank details.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null },
      { name: 'provider_type', type: 'provider_type', nullable: false, default: "'individual'" },
      { name: 'business_name', type: 'text', nullable: true, default: null },
      { name: 'business_address', type: 'text', nullable: true, default: null },
      { name: 'service_areas', type: 'text[]', nullable: true, default: '{}' },
      { name: 'nin_number', type: 'text', nullable: true, default: null },
      { name: 'nin_verified', type: 'boolean', nullable: true, default: 'false' },
      { name: 'cac_number', type: 'text', nullable: true, default: null },
      { name: 'cac_document_url', type: 'text', nullable: true, default: null },
      { name: 'cac_verified', type: 'boolean', nullable: true, default: 'false' },
      { name: 'verification_status', type: 'verification_status', nullable: true, default: "'pending'" },
      { name: 'allows_negotiation', type: 'boolean', nullable: false, default: 'true' },
      { name: 'rating', type: 'numeric', nullable: true, default: '0' },
      { name: 'total_bookings', type: 'integer', nullable: true, default: '0' },
      { name: 'acceptance_rate', type: 'numeric', nullable: true, default: '0' },
      { name: 'response_time', type: 'integer', nullable: true, default: '0' },
      { name: 'bank_name', type: 'text', nullable: true, default: null },
      { name: 'account_number', type: 'text', nullable: true, default: null },
      { name: 'account_name', type: 'text', nullable: true, default: null },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Providers can view their own data', command: 'SELECT', description: 'auth.uid() = user_id' },
      { name: 'Providers can update their own data', command: 'UPDATE', description: 'auth.uid() = user_id' },
      { name: 'Users can create provider profile', command: 'INSERT', description: 'auth.uid() = user_id' },
      { name: 'Consumers can view verified providers', command: 'SELECT', description: "verification_status = 'approved'" },
      { name: 'Admins can manage all providers', command: 'ALL', description: "has_role(auth.uid(), 'admin')" },
    ],
  },
  {
    name: 'drivers',
    icon: <Car size={18} />,
    description: 'Driver profiles with license info, NIN verification, and provider link.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null },
      { name: 'provider_id', type: 'uuid', nullable: true, default: null, description: 'FK → providers.id' },
      { name: 'license_number', type: 'text', nullable: false, default: null },
      { name: 'license_expiry', type: 'date', nullable: false, default: null },
      { name: 'nin_number', type: 'text', nullable: true, default: null },
      { name: 'nin_verified', type: 'boolean', nullable: true, default: 'false' },
      { name: 'verification_status', type: 'verification_status', nullable: true, default: "'pending'" },
      { name: 'available', type: 'boolean', nullable: true, default: 'true' },
      { name: 'assigned_vehicle_id', type: 'uuid', nullable: true, default: null, description: 'FK → vehicles.id' },
      { name: 'rating', type: 'numeric', nullable: true, default: '0' },
      { name: 'total_trips', type: 'integer', nullable: true, default: '0' },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Drivers can view their own data', command: 'SELECT', description: 'auth.uid() = user_id' },
      { name: 'Drivers can update their own data', command: 'UPDATE', description: 'auth.uid() = user_id' },
      { name: 'Users can create driver profile', command: 'INSERT', description: 'auth.uid() = user_id' },
      { name: 'Providers can view their drivers', command: 'SELECT', description: 'Provider owns the driver' },
      { name: 'Providers can manage their drivers', command: 'ALL', description: 'Provider owns the driver' },
      { name: 'Admins can manage all drivers', command: 'ALL', description: "has_role(auth.uid(), 'admin')" },
    ],
  },
  {
    name: 'vehicles',
    icon: <Car size={18} />,
    description: 'Vehicle inventory managed by providers.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'provider_id', type: 'uuid', nullable: false, default: null, description: 'FK → providers.id' },
      { name: 'make', type: 'text', nullable: false, default: null },
      { name: 'model', type: 'text', nullable: false, default: null },
      { name: 'year', type: 'integer', nullable: false, default: null },
      { name: 'color', type: 'text', nullable: false, default: null },
      { name: 'plate_number', type: 'text', nullable: false, default: null },
      { name: 'vehicle_type', type: 'vehicle_type', nullable: false, default: null },
      { name: 'seats', type: 'integer', nullable: false, default: '4' },
      { name: 'daily_rate', type: 'numeric', nullable: false, default: null },
      { name: 'images', type: 'text[]', nullable: true, default: '{}' },
      { name: 'available', type: 'boolean', nullable: true, default: 'true' },
      { name: 'assigned_driver_id', type: 'uuid', nullable: true, default: null, description: 'FK → drivers.id' },
      { name: 'verified', type: 'boolean', nullable: true, default: 'false' },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Providers can manage their vehicles', command: 'ALL', description: 'Provider owns the vehicle' },
      { name: 'Everyone can view available vehicles', command: 'SELECT', description: 'available = true AND verified = true' },
      { name: 'Admins can manage all vehicles', command: 'ALL', description: "has_role(auth.uid(), 'admin')" },
    ],
  },
  {
    name: 'bookings',
    icon: <BookOpen size={18} />,
    description: 'Core booking records with full lifecycle tracking.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'consumer_id', type: 'uuid', nullable: false, default: null, description: 'auth.users.id of consumer' },
      { name: 'provider_id', type: 'uuid', nullable: true, default: null, description: 'FK → providers.id' },
      { name: 'driver_id', type: 'uuid', nullable: true, default: null, description: 'FK → drivers.id' },
      { name: 'vehicle_id', type: 'uuid', nullable: true, default: null, description: 'FK → vehicles.id' },
      { name: 'booking_type', type: 'booking_type', nullable: false, default: null },
      { name: 'vehicle_preference', type: 'vehicle_type', nullable: true, default: null },
      { name: 'scheduled_date', type: 'date', nullable: false, default: null },
      { name: 'scheduled_time', type: 'time', nullable: false, default: null },
      { name: 'pickup_lat', type: 'numeric', nullable: false, default: null },
      { name: 'pickup_lng', type: 'numeric', nullable: false, default: null },
      { name: 'pickup_address', type: 'text', nullable: false, default: null },
      { name: 'pickup_name', type: 'text', nullable: true, default: null },
      { name: 'dropoff_lat', type: 'numeric', nullable: false, default: null },
      { name: 'dropoff_lng', type: 'numeric', nullable: false, default: null },
      { name: 'dropoff_address', type: 'text', nullable: false, default: null },
      { name: 'dropoff_name', type: 'text', nullable: true, default: null },
      { name: 'status', type: 'booking_status', nullable: false, default: "'pending'" },
      { name: 'estimated_min_price', type: 'numeric', nullable: true, default: null },
      { name: 'estimated_max_price', type: 'numeric', nullable: true, default: null },
      { name: 'negotiated_price', type: 'numeric', nullable: true, default: null },
      { name: 'final_price', type: 'numeric', nullable: true, default: null },
      { name: 'matching_started_at', type: 'timestamptz', nullable: true, default: null },
      { name: 'matched_at', type: 'timestamptz', nullable: true, default: null },
      { name: 'confirmed_at', type: 'timestamptz', nullable: true, default: null },
      { name: 'started_at', type: 'timestamptz', nullable: true, default: null },
      { name: 'completed_at', type: 'timestamptz', nullable: true, default: null },
      { name: 'cancelled_at', type: 'timestamptz', nullable: true, default: null },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Consumers can view their bookings', command: 'SELECT', description: 'auth.uid() = consumer_id' },
      { name: 'Consumers can create bookings', command: 'INSERT', description: 'auth.uid() = consumer_id' },
      { name: 'Consumers can update their pending bookings', command: 'UPDATE', description: 'auth.uid() = consumer_id' },
      { name: 'Providers can view assigned bookings', command: 'SELECT', description: 'Provider is assigned' },
      { name: 'Providers can update assigned bookings', command: 'UPDATE', description: 'Provider is assigned' },
      { name: 'Providers can view pending bookings for matching', command: 'SELECT', description: "status IN ('pending','matching') AND provider is approved" },
      { name: 'Providers can claim pending bookings', command: 'UPDATE', description: 'status IN (pending, matching) AND no provider assigned' },
      { name: 'Drivers can view their assigned trips', command: 'SELECT', description: 'Driver is assigned' },
      { name: 'Drivers can update their trips', command: 'UPDATE', description: 'Driver is assigned' },
      { name: 'Drivers can view provider pending bookings', command: 'SELECT', description: 'Driver belongs to the assigned provider' },
      { name: 'Admins can manage all bookings', command: 'ALL', description: "has_role(auth.uid(), 'admin')" },
    ],
  },
  {
    name: 'chat_messages',
    icon: <MessageSquare size={18} />,
    description: 'In-booking chat and price negotiation messages.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'booking_id', type: 'uuid', nullable: false, default: null, description: 'FK → bookings.id' },
      { name: 'sender_id', type: 'uuid', nullable: false, default: null },
      { name: 'sender_role', type: 'app_role', nullable: false, default: null },
      { name: 'content', type: 'text', nullable: false, default: null },
      { name: 'message_type', type: 'text', nullable: false, default: "'text'", description: "'text' | 'price-proposal'" },
      { name: 'proposed_price', type: 'numeric', nullable: true, default: null },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Booking participants can view messages', command: 'SELECT', description: 'User is consumer, provider, or driver on the booking' },
      { name: 'Booking participants can send messages', command: 'INSERT', description: 'sender_id = auth.uid() AND user is a booking participant' },
    ],
    notes: ['No UPDATE or DELETE allowed', 'Realtime enabled for live chat'],
  },
  {
    name: 'payments',
    icon: <CreditCard size={18} />,
    description: 'Payment records linked to bookings, supporting Flutterwave.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'booking_id', type: 'uuid', nullable: false, default: null, description: 'FK → bookings.id' },
      { name: 'consumer_id', type: 'uuid', nullable: false, default: null },
      { name: 'provider_id', type: 'uuid', nullable: true, default: null },
      { name: 'amount', type: 'numeric', nullable: false, default: null },
      { name: 'currency', type: 'text', nullable: false, default: "'NGN'" },
      { name: 'status', type: 'text', nullable: false, default: "'pending'" },
      { name: 'flutterwave_tx_id', type: 'text', nullable: true, default: null },
      { name: 'flutterwave_ref', type: 'text', nullable: true, default: null },
      { name: 'payment_method', type: 'text', nullable: true, default: null },
      { name: 'customer_email', type: 'text', nullable: true, default: null },
      { name: 'customer_name', type: 'text', nullable: true, default: null },
      { name: 'customer_phone', type: 'text', nullable: true, default: null },
      { name: 'metadata', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Consumers can view their own payments', command: 'SELECT', description: 'auth.uid() = consumer_id' },
      { name: 'Consumers can create payments', command: 'INSERT', description: 'auth.uid() = consumer_id' },
      { name: 'Consumers can update their own payments', command: 'UPDATE', description: 'auth.uid() = consumer_id' },
      { name: 'Providers can view payments for their bookings', command: 'SELECT', description: 'Provider owns the payment' },
      { name: 'Admins can manage all payments', command: 'ALL', description: "has_role(auth.uid(), 'admin')" },
    ],
  },
  {
    name: 'notifications',
    icon: <Bell size={18} />,
    description: 'In-app notification system, auto-generated by booking triggers.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null },
      { name: 'title', type: 'text', nullable: false, default: null },
      { name: 'message', type: 'text', nullable: false, default: null },
      { name: 'type', type: 'text', nullable: false, default: "'info'", description: "'info' | 'booking' | 'negotiation' | 'trip'" },
      { name: 'related_booking_id', type: 'uuid', nullable: true, default: null, description: 'FK → bookings.id' },
      { name: 'read', type: 'boolean', nullable: false, default: 'false' },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Users can view their own notifications', command: 'SELECT', description: 'auth.uid() = user_id' },
      { name: 'Users can update their own notifications', command: 'UPDATE', description: 'auth.uid() = user_id' },
      { name: 'System can insert notifications', command: 'INSERT', description: 'Open (WITH CHECK true) — used by triggers' },
    ],
    notes: ['No DELETE allowed', 'Auto-generated by notify_booking_status_change() trigger'],
  },
  {
    name: 'push_subscriptions',
    icon: <Smartphone size={18} />,
    description: 'Web Push subscription storage for browser notifications.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false, default: null },
      { name: 'endpoint', type: 'text', nullable: false, default: null },
      { name: 'p256dh', type: 'text', nullable: false, default: null },
      { name: 'auth', type: 'text', nullable: false, default: null },
      { name: 'role', type: 'text', nullable: false, default: null },
      { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, default: 'now()' },
    ],
    rlsPolicies: [
      { name: 'Users can view their own subscriptions', command: 'SELECT', description: 'auth.uid() = user_id' },
      { name: 'Users can create their own subscriptions', command: 'INSERT', description: 'auth.uid() = user_id' },
      { name: 'Users can update their own subscriptions', command: 'UPDATE', description: 'auth.uid() = user_id' },
      { name: 'Users can delete their own subscriptions', command: 'DELETE', description: 'auth.uid() = user_id' },
    ],
  },
];

const edgeFunctions = [
  {
    name: 'create-test-users',
    method: 'POST',
    description: 'Seeds demo/test user accounts for all four roles (consumer, provider, driver, admin).',
    auth: 'No JWT required',
    body: 'None',
    response: '{ success: true, users: [...] }',
  },
  {
    name: 'seed-demo-data',
    method: 'POST',
    description: 'Seeds demo vehicles, bookings, and other test data for development purposes.',
    auth: 'No JWT required',
    body: 'None',
    response: '{ success: true }',
  },
  {
    name: 'get-vapid-key',
    method: 'GET',
    description: 'Returns the VAPID public key for Web Push notification subscription.',
    auth: 'No JWT required',
    body: 'None',
    response: '{ vapidPublicKey: "..." }',
  },
  {
    name: 'send-push-notification',
    method: 'POST',
    description: 'Sends a Web Push notification to a specific user. Called by database triggers.',
    auth: 'Service role key required',
    body: '{ type, table, record: { user_id, title, message, ... } }',
    response: '{ success: true }',
  },
];

const dbFunctions = [
  { name: 'has_role(_user_id uuid, _role app_role)', returns: 'boolean', description: 'Checks if a user has a specific role. SECURITY DEFINER — bypasses RLS.' },
  { name: 'handle_new_user()', returns: 'trigger', description: 'Auto-creates a profile row when a new user signs up via auth.users.' },
  { name: 'update_updated_at_column()', returns: 'trigger', description: 'Auto-updates the updated_at timestamp on row modification.' },
  { name: 'notify_booking_status_change()', returns: 'trigger', description: 'Creates notifications when booking status transitions (matched, confirmed, in-progress, completed).' },
  { name: 'notify_providers_new_booking()', returns: 'trigger', description: 'Notifies all approved providers when a new pending booking is created.' },
  { name: 'notify_chat_message()', returns: 'trigger', description: 'Creates notification on price-proposal chat messages.' },
  { name: 'trigger_push_notification()', returns: 'trigger', description: 'Calls send-push-notification edge function when a notification is inserted.' },
];

// ─── Sub-components ──────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Copy">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm text-foreground font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-card hover:bg-muted/50 transition-colors text-left"
      >
        <span className="text-accent">{icon}</span>
        <span className="flex-1 font-semibold text-foreground">{title}</span>
        {open ? <ChevronDown size={18} className="text-muted-foreground" /> : <ChevronRight size={18} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-5 border-t border-border bg-background">{children}</div>}
    </div>
  );
}

function TableSection({ table }: { table: TableDef }) {
  return (
    <CollapsibleSection title={table.name} icon={table.icon}>
      <p className="text-sm text-muted-foreground mb-4">{table.description}</p>

      {table.notes && (
        <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
          {table.notes.map((n, i) => (
            <p key={i} className="text-xs text-accent flex items-start gap-2">
              <span className="mt-0.5">⚡</span> {n}
            </p>
          ))}
        </div>
      )}

      {/* Columns */}
      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <Table size={14} /> Columns
      </h4>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Column</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Type</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Nullable</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Default</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Notes</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((col) => (
              <tr key={col.name} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-3 font-mono text-xs text-foreground">{col.name}</td>
                <td className="py-2 px-3 font-mono text-xs text-accent">{col.type}</td>
                <td className="py-2 px-3 text-xs">{col.nullable ? '✓' : '✗'}</td>
                <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{col.default || '—'}</td>
                <td className="py-2 px-3 text-xs text-muted-foreground">{col.description || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RLS Policies */}
      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <Shield size={14} /> RLS Policies
      </h4>
      <div className="space-y-2">
        {table.rlsPolicies.map((p, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              p.command === 'SELECT' ? 'bg-blue-500/10 text-blue-500' :
              p.command === 'INSERT' ? 'bg-green-500/10 text-green-500' :
              p.command === 'UPDATE' ? 'bg-amber-500/10 text-amber-500' :
              p.command === 'DELETE' ? 'bg-red-500/10 text-red-500' :
              'bg-purple-500/10 text-purple-500'
            }`}>
              {p.command}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: <Globe size={16} /> },
    { id: 'auth', label: 'Authentication', icon: <Key size={16} /> },
    { id: 'tables', label: 'Tables & Schema', icon: <Database size={16} /> },
    { id: 'enums', label: 'Enums', icon: <FileJson size={16} /> },
    { id: 'functions', label: 'DB Functions', icon: <Zap size={16} /> },
    { id: 'edge', label: 'Edge Functions', icon: <Code size={16} /> },
    { id: 'realtime', label: 'Realtime', icon: <Zap size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={18} className="text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Database size={20} className="text-accent" /> API Documentation
            </h1>
            <p className="text-xs text-muted-foreground">For Mobile & External Developers</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Nav */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s.id ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-10 pb-20">
          {/* Overview */}
          <section id="overview">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-foreground mb-4">🚀 Quick Start</h2>
              <p className="text-muted-foreground mb-6">
                Connect your mobile app to the CarHire2Go backend using the Supabase client SDK. 
                All data access is governed by Row-Level Security (RLS) policies — the same rules apply 
                whether you're using the web app or mobile SDK.
              </p>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-accent" /> API URL
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-accent break-all flex-1">{API_BASE_URL}</code>
                    <CopyButton text={API_BASE_URL} />
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Key size={16} className="text-accent" /> Anon Key (Public)
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground break-all flex-1 line-clamp-2">{ANON_KEY.slice(0, 50)}...</code>
                    <CopyButton text={ANON_KEY} />
                  </div>
                </div>
              </div>

              <CodeBlock
                label="Flutter — Initialize Client"
                code={`import 'package:supabase_flutter/supabase_flutter.dart';

await Supabase.initialize(
  url: '${API_BASE_URL}',
  anonKey: '${ANON_KEY}',
);
final supabase = Supabase.instance.client;`}
              />

              <div className="mt-4">
                <CodeBlock
                  label="React Native / Kotlin — Initialize Client"
                  code={`import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  '${API_BASE_URL}',
  '${ANON_KEY}'
);`}
                />
              </div>
            </motion.div>
          </section>

          {/* Authentication */}
          <section id="auth">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Key size={22} className="text-accent" /> Authentication
            </h2>
            <p className="text-muted-foreground mb-4">
              Uses Supabase Auth (email + password). After signup, a profile is auto-created and a role must be assigned.
            </p>

            <div className="space-y-4">
              <CodeBlock
                label="Sign Up"
                code={`// 1. Create account
final res = await supabase.auth.signUp(
  email: 'user@example.com',
  password: 'securePass123',
  data: { 'name': 'John Doe' },
);

// 2. Assign role (consumer, provider, driver, admin)
await supabase.from('user_roles').insert({
  'user_id': res.user!.id,
  'role': 'consumer',
});`}
              />

              <CodeBlock
                label="Sign In"
                code={`final res = await supabase.auth.signInWithPassword(
  email: 'user@example.com',
  password: 'securePass123',
);

// Get user roles
final roles = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', res.user!.id);`}
              />

              <CodeBlock
                label="Sign Out"
                code={`await supabase.auth.signOut();`}
              />

              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lock size={16} className="text-accent" /> Demo Test Accounts
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Password for all: <code className="bg-muted px-1.5 py-0.5 rounded">testtest123</code></p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {['user@instantryde.ng → consumer', 'provider@instantryde.ng → provider', 'driver@instantryde.ng → driver', 'admin@instantryde.ng → admin'].map((a) => (
                    <div key={a} className="text-xs font-mono text-muted-foreground bg-muted/50 p-2 rounded">{a}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tables */}
          <section id="tables">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Database size={22} className="text-accent" /> Tables & Schema
            </h2>
            <p className="text-muted-foreground mb-6">
              {tables.length} tables with Row-Level Security. Click to expand schema details and RLS policies.
            </p>
            <div className="space-y-3">
              {tables.map((t) => (
                <TableSection key={t.name} table={t} />
              ))}
            </div>
          </section>

          {/* Enums */}
          <section id="enums">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileJson size={22} className="text-accent" /> Enums
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {enums.map((e) => (
                <div key={e.name} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-semibold font-mono text-accent mb-2">{e.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {e.values.map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-mono">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DB Functions */}
          <section id="functions">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap size={22} className="text-accent" /> Database Functions & Triggers
            </h2>
            <div className="space-y-3">
              {dbFunctions.map((f) => (
                <div key={f.name} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-mono font-semibold text-foreground">{f.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent/10 text-accent shrink-0">
                      {f.returns}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Edge Functions */}
          <section id="edge">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Code size={22} className="text-accent" /> Edge Functions (Serverless)
            </h2>
            <p className="text-muted-foreground mb-4">
              Base URL: <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{API_BASE_URL}/functions/v1/</code>
            </p>
            <div className="space-y-3">
              {edgeFunctions.map((fn) => (
                <div key={fn.name} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fn.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {fn.method}
                    </span>
                    <code className="text-sm font-mono font-semibold text-foreground">/functions/v1/{fn.name}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{fn.description}</p>
                  <div className="grid gap-2 sm:grid-cols-3 text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Auth:</span>{' '}
                      <span className="text-foreground">{fn.auth}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Body:</span>{' '}
                      <span className="font-mono text-foreground">{fn.body}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Response:</span>{' '}
                      <span className="font-mono text-foreground">{fn.response}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <CodeBlock
                label="Calling Edge Functions"
                code={`// From Supabase SDK
final res = await supabase.functions.invoke('get-vapid-key');

// Or via HTTP
GET ${API_BASE_URL}/functions/v1/get-vapid-key
Headers:
  apikey: <ANON_KEY>
  Authorization: Bearer <USER_JWT> (if auth required)`}
              />
            </div>
          </section>

          {/* Realtime */}
          <section id="realtime">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap size={22} className="text-accent" /> Realtime Subscriptions
            </h2>
            <p className="text-muted-foreground mb-4">
              Subscribe to database changes in real-time. Useful for live chat, booking status updates, and notifications.
            </p>
            <CodeBlock
              label="Subscribe to Chat Messages (Flutter)"
              code={`final channel = supabase
  .channel('chat-\$bookingId')
  .onPostgresChanges(
    event: PostgresChangeEvent.insert,
    schema: 'public',
    table: 'chat_messages',
    filter: PostgresChangeFilter(
      type: PostgresChangeFilterType.eq,
      column: 'booking_id',
      value: bookingId,
    ),
    callback: (payload) {
      final newMessage = payload.newRecord;
      // Handle new message
    },
  )
  .subscribe();

// Clean up
await supabase.removeChannel(channel);`}
            />

            <div className="mt-4">
              <CodeBlock
                label="Subscribe to Booking Status (React Native)"
                code={`const channel = supabase
  .channel('booking-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings',
    filter: \`consumer_id=eq.\${userId}\`,
  }, (payload) => {
    console.log('Booking updated:', payload.new);
  })
  .subscribe();

// Clean up
supabase.removeChannel(channel);`}
              />
            </div>

            <div className="mt-6 p-4 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-semibold mb-2">Realtime-Enabled Tables</h3>
              <div className="flex flex-wrap gap-2">
                {['chat_messages', 'bookings', 'notifications'].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent font-mono">{t}</span>
                ))}
              </div>
            </div>
          </section>

          {/* CRUD Examples */}
          <section id="crud">
            <h2 className="text-2xl font-bold text-foreground mb-4">📱 Common CRUD Examples</h2>

            <div className="space-y-4">
              <CodeBlock
                label="Create a Booking (Flutter)"
                code={`final booking = await supabase.from('bookings').insert({
  'consumer_id': supabase.auth.currentUser!.id,
  'booking_type': 'full-day',
  'scheduled_date': '2026-04-15',
  'scheduled_time': '09:00',
  'pickup_lat': 6.5244,
  'pickup_lng': 3.3792,
  'pickup_address': 'Victoria Island, Lagos',
  'dropoff_lat': 6.4541,
  'dropoff_lng': 3.3947,
  'dropoff_address': 'Lekki Phase 1, Lagos',
}).select().single();`}
              />

              <CodeBlock
                label="Fetch User's Bookings"
                code={`final bookings = await supabase
  .from('bookings')
  .select('*, vehicles(*), drivers(*)')
  .eq('consumer_id', userId)
  .order('created_at', ascending: false);`}
              />

              <CodeBlock
                label="Update Booking Status (Provider)"
                code={`await supabase.from('bookings').update({
  'status': 'matched',
  'provider_id': providerId,
  'matched_at': DateTime.now().toIso8601String(),
}).eq('id', bookingId);`}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
