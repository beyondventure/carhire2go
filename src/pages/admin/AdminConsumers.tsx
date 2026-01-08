import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Star, MapPin, Eye, MoreVertical, Ban, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CURRENCY } from '@/lib/constants';

const consumers = [
  {
    id: 'c1',
    name: 'John Adebayo',
    email: 'john@example.com',
    phone: '+234 801 234 5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    totalBookings: 24,
    totalSpent: 456000,
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
    status: 'active',
  },
  {
    id: 'c2',
    name: 'Amaka Obi',
    email: 'amaka@example.com',
    phone: '+234 802 345 6789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amaka',
    totalBookings: 18,
    totalSpent: 324000,
    joinedAt: new Date('2024-02-20'),
    lastActive: new Date(Date.now() - 86400000),
    status: 'active',
  },
  {
    id: 'c3',
    name: 'Olumide Fashola',
    email: 'olumide@example.com',
    phone: '+234 803 456 7890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olumide',
    totalBookings: 8,
    totalSpent: 128000,
    joinedAt: new Date('2024-03-10'),
    lastActive: new Date(Date.now() - 86400000 * 7),
    status: 'inactive',
  },
  {
    id: 'c4',
    name: 'Fatima Abubakar',
    email: 'fatima@example.com',
    phone: '+234 804 567 8901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    totalBookings: 32,
    totalSpent: 680000,
    joinedAt: new Date('2023-11-05'),
    lastActive: new Date(),
    status: 'active',
  },
];

export default function AdminConsumers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredConsumers = consumers.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
    }
    return true;
  });

  const totalConsumers = consumers.length;
  const activeConsumers = consumers.filter(c => c.status === 'active').length;
  const totalBookings = consumers.reduce((sum, c) => sum + c.totalBookings, 0);
  const totalGMV = consumers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <DashboardLayout title="Consumers" subtitle="Manage registered consumers">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Consumers"
          value={totalConsumers.toString()}
          icon={Users}
        />
        <MetricCard
          title="Active Users"
          value={activeConsumers.toString()}
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Total Bookings"
          value={totalBookings.toString()}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Consumer GMV"
          value={`${CURRENCY}${(totalGMV / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search consumers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Consumers Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-4 font-medium">Consumer</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Bookings</th>
              <th className="p-4 font-medium">Total Spent</th>
              <th className="p-4 font-medium">Last Active</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredConsumers.map((consumer, index) => (
              <motion.tr
                key={consumer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-muted/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={consumer.avatar}
                      alt={consumer.name}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-foreground">{consumer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(consumer.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-foreground">{consumer.email}</p>
                  <p className="text-xs text-muted-foreground">{consumer.phone}</p>
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {consumer.totalBookings}
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {CURRENCY}{consumer.totalSpent.toLocaleString()}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(consumer.lastActive).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    consumer.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {consumer.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Ban size={16} />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
