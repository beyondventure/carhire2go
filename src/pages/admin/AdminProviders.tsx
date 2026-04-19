import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Star, Car, Users, Shield, Eye, Ban, Check, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProviders } from '@/hooks/useProviders';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

export default function AdminProviders() {
  const { allProviders, isLoading, updateProvider } = useProviders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const filteredProviders = allProviders.filter(p => {
    if (statusFilter === 'approved' && p.verification_status !== 'approved') return false;
    if (statusFilter === 'pending' && p.verification_status === 'approved') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (p.business_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalProviders = allProviders.length;
  const verifiedProviders = allProviders.filter(p => p.verification_status === 'approved').length;

  const handleApprove = async (id: string, name: string) => {
    const result = await updateProvider(id, { verification_status: 'approved' });
    if (result) toast.success(`${name} has been approved`);
  };

  const handleSuspend = async (id: string, name: string) => {
    const result = await updateProvider(id, { verification_status: 'rejected' });
    if (result) toast.error(`${name} has been suspended`);
  };

  return (
    <DashboardLayout title="Providers" subtitle="Manage registered providers">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Providers" value={totalProviders.toString()} icon={Building2} />
        <MetricCard title="Verified" value={verifiedProviders.toString()} icon={Shield} variant="success" />
        <MetricCard title="Pending" value={(totalProviders - verifiedProviders).toString()} icon={Car} variant="warning" />
        <MetricCard
          title="Approval Rate"
          value={totalProviders > 0 ? `${Math.round((verifiedProviders / totalProviders) * 100)}%` : '0%'}
          icon={Building2}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'approved', 'pending'] as const).map(status => (
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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No providers found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search' : 'No providers have registered yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProviders.map((provider, index) => {
              const isVerified = provider.verification_status === 'approved';
              const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.id}`;
              const displayName = provider.business_name || `Provider ${provider.id.slice(0, 6)}`;

              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img src={avatar} alt={displayName} className="w-14 h-14 rounded-xl" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{displayName}</h4>
                          {isVerified && <Shield size={16} className="text-success" />}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {provider.provider_type} · {provider.verification_status}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-warning">
                            <Star size={14} className="fill-warning" />
                            {provider.rating?.toFixed(1) ?? '—'}
                          </span>
                          <span className="text-muted-foreground">
                            {provider.total_bookings ?? 0} bookings
                          </span>
                          {provider.service_areas && provider.service_areas.length > 0 && (
                            <span className="text-muted-foreground">
                              {provider.service_areas.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{provider.total_bookings ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Bookings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground capitalize px-2 py-1 rounded-full bg-muted">
                          {provider.verification_status}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast.info(`Viewing ${displayName}`)}>
                          <Eye size={18} />
                        </Button>
                        {!isVerified && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-success"
                            onClick={() => handleApprove(provider.id, displayName)}
                          >
                            <Check size={18} />
                          </Button>
                        )}
                        {isVerified && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive"
                            onClick={() => handleSuspend(provider.id, displayName)}
                          >
                            <Ban size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
