import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, Edit, Trash2, Eye, EyeOff, Users, Calendar, TrendingUp, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { FleetUtilizationChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { mockVehicles, mockDrivers } from '@/lib/mock-data';
import { CURRENCY, VEHICLE_TYPES } from '@/lib/constants';
import type { Vehicle } from '@/types';

export default function ProviderFleet() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const availableVehicles = vehicles.filter(v => v.available).length;
  const totalRevenue = vehicles.reduce((sum, v) => sum + v.dailyRate * 20, 0); // Simulated monthly
  const avgUtilization = 78;

  const filteredVehicles = vehicles.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'available') return v.available;
    if (filter === 'unavailable') return !v.available;
    return v.type === filter;
  });

  const toggleAvailability = (vehicleId: string) => {
    setVehicles(vehicles.map(v =>
      v.id === vehicleId ? { ...v, available: !v.available } : v
    ));
  };

  const getAssignedDriver = (vehicleId: string) => {
    return mockDrivers.find(d => d.assignedVehicleId === vehicleId);
  };

  return (
    <DashboardLayout title="Fleet Management" subtitle="Manage your vehicles and track utilization">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Vehicles"
          value={vehicles.length.toString()}
          icon={Car}
        />
        <MetricCard
          title="Available"
          value={availableVehicles.toString()}
          icon={Eye}
          variant="success"
        />
        <MetricCard
          title="Fleet Utilization"
          value={`${avgUtilization}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`${CURRENCY}${(totalRevenue / 1000000).toFixed(1)}M`}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vehicles List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">Vehicles</h3>
                <div className="flex gap-2">
                  {['all', 'available', 'unavailable'].map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className="capitalize text-xs"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Add Vehicle
              </Button>
            </div>

            <div className="divide-y divide-border">
              {filteredVehicles.map((vehicle, index) => {
                const driver = getAssignedDriver(vehicle.id);
                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedVehicle?.id === vehicle.id ? 'bg-accent/5' : ''
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-20 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {vehicle.make} {vehicle.model}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground capitalize">
                            {vehicle.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{vehicle.plateNumber}</span>
                          <span>•</span>
                          <span>{vehicle.year}</span>
                          <span>•</span>
                          <span>{vehicle.seats} seats</span>
                        </div>
                        {driver && (
                          <div className="flex items-center gap-1.5 mt-1 text-sm">
                            <Users size={12} className="text-accent" />
                            <span className="text-foreground">{driver.user.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {CURRENCY}{vehicle.dailyRate.toLocaleString()}
                          <span className="text-xs text-muted-foreground font-normal">/day</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {vehicle.available ? 'Available' : 'Unavailable'}
                          </span>
                          <Switch
                            checked={vehicle.available}
                            onCheckedChange={() => toggleAvailability(vehicle.id)}
                          />
                        </div>
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
          {/* Selected Vehicle Details */}
          {selectedVehicle ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <img
                src={selectedVehicle.images[0]}
                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h4 className="font-semibold text-foreground text-lg">
                  {selectedVehicle.make} {selectedVehicle.model}
                </h4>
                <p className="text-muted-foreground text-sm mb-4">{selectedVehicle.year}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground capitalize">{selectedVehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plate Number</span>
                    <span className="text-foreground">{selectedVehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color</span>
                    <span className="text-foreground">{selectedVehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span className="text-foreground font-semibold">
                      {CURRENCY}{selectedVehicle.dailyRate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={selectedVehicle.available ? 'confirmed' : 'cancelled'} />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Car size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a vehicle to view details</p>
            </div>
          )}

          {/* Fleet Utilization Chart */}
          <FleetUtilizationChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
