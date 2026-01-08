import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Star, Car, Phone, Mail, Shield, Calendar, MoreVertical } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DriverPerformanceChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { mockDrivers, mockVehicles } from '@/lib/mock-data';
import type { Driver } from '@/types';

export default function ProviderDrivers() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const activeDrivers = drivers.filter(d => d.available).length;
  const avgRating = (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1);
  const totalTrips = drivers.reduce((sum, d) => sum + d.totalTrips, 0);

  const toggleAvailability = (driverId: string) => {
    setDrivers(drivers.map(d =>
      d.id === driverId ? { ...d, available: !d.available } : d
    ));
  };

  const getAssignedVehicle = (vehicleId?: string) => {
    return mockVehicles.find(v => v.id === vehicleId);
  };

  return (
    <DashboardLayout title="Driver Management" subtitle="Manage your drivers and track performance">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Drivers"
          value={drivers.length.toString()}
          icon={Users}
        />
        <MetricCard
          title="Active Now"
          value={activeDrivers.toString()}
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Avg Rating"
          value={avgRating}
          icon={Star}
          trend={{ value: 0.2, isPositive: true }}
        />
        <MetricCard
          title="Total Trips"
          value={totalTrips.toLocaleString()}
          icon={Car}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Drivers List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Drivers</h3>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Add Driver
              </Button>
            </div>

            <div className="divide-y divide-border">
              {drivers.map((driver, index) => {
                const vehicle = getAssignedVehicle(driver.assignedVehicleId);
                return (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedDriver?.id === driver.id ? 'bg-accent/5' : ''
                    }`}
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={driver.user.avatar}
                          alt={driver.user.name}
                          className="w-14 h-14 rounded-xl"
                        />
                        {driver.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                            <Shield size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{driver.user.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-warning fill-warning" />
                            {driver.rating}
                          </span>
                          <span>•</span>
                          <span>{driver.totalTrips} trips</span>
                        </div>
                        {vehicle && (
                          <div className="flex items-center gap-1.5 mt-1 text-sm">
                            <Car size={12} className="text-accent" />
                            <span className="text-foreground">{vehicle.make} {vehicle.model}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            driver.available
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {driver.available ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <Switch
                          checked={driver.available}
                          onCheckedChange={() => toggleAvailability(driver.id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Driver Details */}
          {selectedDriver ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border"
            >
              <div className="p-5 text-center border-b border-border">
                <img
                  src={selectedDriver.user.avatar}
                  alt={selectedDriver.user.name}
                  className="w-20 h-20 rounded-xl mx-auto mb-3"
                />
                <h4 className="font-semibold text-foreground text-lg">{selectedDriver.user.name}</h4>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="text-foreground">{selectedDriver.rating}</span>
                  <span className="text-muted-foreground">({selectedDriver.totalTrips} trips)</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Phone size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{selectedDriver.user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mail size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{selectedDriver.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Shield size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">License</p>
                    <p className="text-sm text-foreground">{selectedDriver.licenseNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">License Expiry</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedDriver.licenseExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={selectedDriver.verified ? 'confirmed' : 'pending'} />
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View Full Profile
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Users size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a driver to view details</p>
            </div>
          )}

          {/* Driver Performance Chart */}
          <DriverPerformanceChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
