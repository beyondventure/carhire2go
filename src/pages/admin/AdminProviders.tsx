import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Star, Car, Users, Shield, MoreVertical, Eye, Ban, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProvider } from '@/lib/mock-data';
import { CURRENCY } from '@/lib/constants';

const providers = [
  { ...mockProvider, id: 'p1', totalEarnings: 18500000 },
  {
    id: 'p2',
    user: { name: 'Lagos Elite Cars', email: 'info@lagoselite.ng', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lagos' },
    businessName: 'Lagos Elite Cars',
    serviceAreas: ['Lagos', 'Ogun'],
    verified: true,
    rating: 4.5,
    totalBookings: 856,
    vehicles: [{ id: '1' }, { id: '2' }, { id: '3' }],
    drivers: [{ id: '1' }, { id: '2' }],
    totalEarnings: 12400000,
  },
  {
    id: 'p3',
    user: { name: 'Abuja Premium Rides', email: 'contact@premiumrides.ng', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=abuja' },
    businessName: 'Abuja Premium Rides',
    serviceAreas: ['Abuja', 'Kaduna'],
    verified: false,
    rating: 4.2,
    totalBookings: 423,
    vehicles: [{ id: '1' }, { id: '2' }],
    drivers: [{ id: '1' }],
    totalEarnings: 6800000,
  },
];

export default function AdminProviders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const filteredProviders = providers.filter((p) => {
    if (statusFilter === 'verified' && !p.verified) return false;
    if (statusFilter === 'pending' && p.verified) return false;
    if (searchQuery) {
      return p.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalProviders = providers.length;
  const verifiedProviders = providers.filter(p => p.verified).length;
  const totalFleetSize = providers.reduce((sum, p) => sum + p.vehicles.length, 0);
  const totalRevenue = providers.reduce((sum, p) => sum + p.totalEarnings, 0);

  return (
    <DashboardLayout title="Providers" subtitle="Manage registered providers">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Providers"
          value={totalProviders.toString()}
          icon={Building2}
        />
        <MetricCard
          title="Verified"
          value={verifiedProviders.toString()}
          icon={Shield}
          variant="success"
        />
        <MetricCard
          title="Total Fleet"
          value={totalFleetSize.toString()}
          icon={Car}
        />
        <MetricCard
          title="Platform Revenue"
          value={`${CURRENCY}${(totalRevenue * 0.1 / 1000000).toFixed(1)}M`}
          icon={Building2}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'pending'] as const).map((status) => (
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

      {/* Providers List */}
      <div className="bg-card rounded-xl border border-border">
        <div className="divide-y divide-border">
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={provider.user.avatar}
                    alt={provider.businessName}
                    className="w-14 h-14 rounded-xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{provider.businessName}</h4>
                      {provider.verified && (
                        <Shield size={16} className="text-success" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.user.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-warning">
                        <Star size={14} className="fill-warning" />
                        {provider.rating}
                      </span>
                      <span className="text-muted-foreground">
                        {provider.totalBookings} bookings
                      </span>
                      <span className="text-muted-foreground">
                        {provider.serviceAreas.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{provider.vehicles.length}</p>
                    <p className="text-xs text-muted-foreground">Vehicles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{provider.drivers.length}</p>
                    <p className="text-xs text-muted-foreground">Drivers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">
                      {CURRENCY}{(provider.totalEarnings / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">GMV</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Eye size={18} />
                    </Button>
                    {!provider.verified && (
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-success">
                        <Check size={18} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive">
                      <Ban size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
