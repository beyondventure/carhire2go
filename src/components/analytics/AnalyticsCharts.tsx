import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CURRENCY } from '@/lib/constants';
import type {
  RevenuePoint, BookingTypePoint, GrowthPoint,
  GMVPoint, SettlementPoint, EarningsPoint,
} from '@/hooks/useAnalytics';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl border border-border p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// ── Revenue Chart ────────────────────────────────────────────────────────────
interface RevenueChartProps { data: RevenuePoint[] }

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartCard title="Revenue Overview" subtitle="Monthly revenue and booking trends">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(175, 84%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(175, 84%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `${CURRENCY}${(v / 1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(175, 84%, 40%)" strokeWidth={2} fill="url(#revenueGradient)" name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── Booking Type Chart ───────────────────────────────────────────────────────
interface BookingTypeChartProps { data: BookingTypePoint[] }

export function BookingTypeChart({ data }: BookingTypeChartProps) {
  return (
    <ChartCard title="Bookings by Type" subtitle="Distribution of booking types">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
              {data.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── Fleet Utilization Chart (static — no DB signal for this yet) ─────────────
const fleetPlaceholder = [
  { day: 'Mon', utilization: 0, available: 100 },
  { day: 'Tue', utilization: 0, available: 100 },
  { day: 'Wed', utilization: 0, available: 100 },
  { day: 'Thu', utilization: 0, available: 100 },
  { day: 'Fri', utilization: 0, available: 100 },
  { day: 'Sat', utilization: 0, available: 100 },
  { day: 'Sun', utilization: 0, available: 100 },
];

export function FleetUtilizationChart() {
  return (
    <ChartCard title="Fleet Utilization" subtitle="Weekly vehicle usage (live data coming)">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fleetPlaceholder}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Bar dataKey="utilization" fill="hsl(175, 84%, 40%)" radius={[4, 4, 0, 0]} name="In Use %" />
            <Bar dataKey="available"   fill="hsl(var(--muted))"  radius={[4, 4, 0, 0]} name="Available %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── Driver Performance Chart (static — no DB signal for this yet) ────────────
export function DriverPerformanceChart() {
  return (
    <ChartCard title="Driver Performance" subtitle="Top drivers this month">
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        Live driver performance data coming soon
      </div>
    </ChartCard>
  );
}

// ── Earnings Trend Chart ─────────────────────────────────────────────────────
interface EarningsTrendChartProps { data?: EarningsPoint[] }

export function EarningsTrendChart({ data = [] }: EarningsTrendChartProps) {
  return (
    <ChartCard title="Earnings Trend" subtitle="Weekly earnings breakdown">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `${CURRENCY}${(v / 1000)}K`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`]}
            />
            <Legend />
            <Line type="monotone" dataKey="gross"      stroke="hsl(175, 84%, 40%)"         strokeWidth={2} name="Gross" />
            <Line type="monotone" dataKey="net"        stroke="hsl(142, 71%, 45%)"         strokeWidth={2} name="Net" />
            <Line type="monotone" dataKey="commission" stroke="hsl(var(--destructive))"    strokeWidth={2} name="Commission" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── Settlement Status Chart ──────────────────────────────────────────────────
interface SettlementStatusChartProps { data?: SettlementPoint[] }

export function SettlementStatusChart({ data = [] }: SettlementStatusChartProps) {
  return (
    <ChartCard title="Settlement Status" subtitle="Current settlement distribution">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
              {data.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── Platform Growth Chart ────────────────────────────────────────────────────
interface PlatformGrowthChartProps { data: GrowthPoint[] }

export function PlatformGrowthChart({ data }: PlatformGrowthChartProps) {
  return (
    <ChartCard title="Platform Growth" subtitle="User acquisition over time">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="consumers" stroke="hsl(175, 84%, 40%)" strokeWidth={2} name="Consumers" />
            <Line type="monotone" dataKey="providers" stroke="hsl(45, 93%, 47%)"  strokeWidth={2} name="Providers" />
            <Line type="monotone" dataKey="drivers"   stroke="hsl(262, 83%, 58%)" strokeWidth={2} name="Drivers" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── GMV Chart ────────────────────────────────────────────────────────────────
interface GMVChartProps { data: GMVPoint[] }

export function GMVChart({ data }: GMVChartProps) {
  return (
    <ChartCard title="Gross Merchandise Value" subtitle="Total transaction volume">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gmvGradient"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="commGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(175, 84%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(175, 84%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `${CURRENCY}${(v / 1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`]}
            />
            <Legend />
            <Area type="monotone" dataKey="gmv"        stroke="hsl(262, 83%, 58%)" strokeWidth={2} fill="url(#gmvGradient)"  name="GMV" />
            <Area type="monotone" dataKey="commission" stroke="hsl(175, 84%, 40%)" strokeWidth={2} fill="url(#commGradient)" name="Platform Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
