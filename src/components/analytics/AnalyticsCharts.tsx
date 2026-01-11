import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CURRENCY } from '@/lib/constants';

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

// Revenue Chart
const revenueData = [
  { month: 'Jan', revenue: 12500000, bookings: 245 },
  { month: 'Feb', revenue: 15800000, bookings: 312 },
  { month: 'Mar', revenue: 18200000, bookings: 368 },
  { month: 'Apr', revenue: 21500000, bookings: 425 },
  { month: 'May', revenue: 25800000, bookings: 510 },
  { month: 'Jun', revenue: 29400000, bookings: 589 },
];

export function RevenueChart() {
  return (
    <ChartCard title="Revenue Overview" subtitle="Monthly revenue and booking trends">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(175, 84%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(175, 84%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${CURRENCY}${(v/1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(175, 84%, 40%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Bookings by Type Chart
const bookingTypeData = [
  { name: 'Full Day', value: 45, color: 'hsl(175, 84%, 40%)' },
  { name: 'Half Day', value: 25, color: 'hsl(45, 93%, 47%)' },
  { name: 'Point-to-Point', value: 20, color: 'hsl(217, 91%, 60%)' },
  { name: 'Event', value: 10, color: 'hsl(262, 83%, 58%)' },
];

export function BookingTypeChart() {
  return (
    <ChartCard title="Bookings by Type" subtitle="Distribution of booking types">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={bookingTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {bookingTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Fleet Utilization Chart
const fleetData = [
  { day: 'Mon', utilization: 78, available: 22 },
  { day: 'Tue', utilization: 85, available: 15 },
  { day: 'Wed', utilization: 72, available: 28 },
  { day: 'Thu', utilization: 92, available: 8 },
  { day: 'Fri', utilization: 88, available: 12 },
  { day: 'Sat', utilization: 95, available: 5 },
  { day: 'Sun', utilization: 65, available: 35 },
];

export function FleetUtilizationChart() {
  return (
    <ChartCard title="Fleet Utilization" subtitle="Weekly vehicle usage">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fleetData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="utilization" fill="hsl(175, 84%, 40%)" radius={[4, 4, 0, 0]} name="In Use %" />
            <Bar dataKey="available" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Available %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Driver Performance Chart
const driverData = [
  { name: 'Ahmed I.', trips: 45, rating: 4.8, earnings: 450000 },
  { name: 'Chidi N.', trips: 38, rating: 4.6, earnings: 380000 },
  { name: 'Yusuf M.', trips: 42, rating: 4.9, earnings: 420000 },
  { name: 'Tunde A.', trips: 35, rating: 4.5, earnings: 350000 },
];

export function DriverPerformanceChart() {
  return (
    <ChartCard title="Driver Performance" subtitle="Top drivers this month">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={driverData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="trips" fill="hsl(175, 84%, 40%)" radius={[0, 4, 4, 0]} name="Trips" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Earnings Trend Chart
const earningsData = [
  { week: 'W1', gross: 850000, net: 765000, commission: 85000 },
  { week: 'W2', gross: 920000, net: 828000, commission: 92000 },
  { week: 'W3', gross: 780000, net: 702000, commission: 78000 },
  { week: 'W4', gross: 1050000, net: 945000, commission: 105000 },
];

export function EarningsTrendChart() {
  return (
    <ChartCard title="Earnings Trend" subtitle="Weekly earnings breakdown">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${CURRENCY}${(v/1000)}K`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`]}
            />
            <Legend />
            <Line type="monotone" dataKey="gross" stroke="hsl(175, 84%, 40%)" strokeWidth={2} name="Gross" />
            <Line type="monotone" dataKey="net" stroke="hsl(142, 71%, 45%)" strokeWidth={2} name="Net" />
            <Line type="monotone" dataKey="commission" stroke="hsl(var(--destructive))" strokeWidth={2} name="Commission" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Settlement Status Chart
const settlementData = [
  { status: 'Completed', value: 65, color: 'hsl(142, 71%, 45%)' },
  { status: 'Processing', value: 25, color: 'hsl(45, 93%, 47%)' },
  { status: 'Pending', value: 10, color: 'hsl(var(--muted))' },
];

export function SettlementStatusChart() {
  return (
    <ChartCard title="Settlement Status" subtitle="Current settlement distribution">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={settlementData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {settlementData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Platform Growth Chart
const growthData = [
  { month: 'Jan', providers: 180, consumers: 5200, drivers: 320 },
  { month: 'Feb', providers: 210, consumers: 6800, drivers: 380 },
  { month: 'Mar', providers: 245, consumers: 8400, drivers: 450 },
  { month: 'Apr', providers: 280, consumers: 9800, drivers: 520 },
  { month: 'May', providers: 315, consumers: 11200, drivers: 580 },
  { month: 'Jun', providers: 342, consumers: 12500, drivers: 640 },
];

export function PlatformGrowthChart() {
  return (
    <ChartCard title="Platform Growth" subtitle="User acquisition over time">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="consumers" stroke="hsl(175, 84%, 40%)" strokeWidth={2} name="Consumers" />
            <Line type="monotone" dataKey="providers" stroke="hsl(45, 93%, 47%)" strokeWidth={2} name="Providers" />
            <Line type="monotone" dataKey="drivers" stroke="hsl(262, 83%, 58%)" strokeWidth={2} name="Drivers" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// GMV Chart
const gmvData = [
  { month: 'Jan', gmv: 45000000, commission: 4500000 },
  { month: 'Feb', gmv: 58000000, commission: 5800000 },
  { month: 'Mar', gmv: 72000000, commission: 7200000 },
  { month: 'Apr', gmv: 85000000, commission: 8500000 },
  { month: 'May', gmv: 98000000, commission: 9800000 },
  { month: 'Jun', gmv: 115000000, commission: 11500000 },
];

export function GMVChart() {
  return (
    <ChartCard title="Gross Merchandise Value" subtitle="Total transaction volume">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={gmvData}>
            <defs>
              <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="commGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(175, 84%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(175, 84%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${CURRENCY}${(v/1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${CURRENCY}${value.toLocaleString()}`]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="gmv"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              fill="url(#gmvGradient)"
              name="GMV"
            />
            <Area
              type="monotone"
              dataKey="commission"
              stroke="hsl(175, 84%, 40%)"
              strokeWidth={2}
              fill="url(#commGradient)"
              name="Platform Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
