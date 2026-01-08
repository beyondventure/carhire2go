import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Star, Car, Camera, Bell, ChevronRight, LogOut, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { mockDrivers, mockVehicles } from '@/lib/mock-data';

export default function DriverProfile() {
  const driver = mockDrivers[0];
  const vehicle = mockVehicles.find(v => v.id === driver.assignedVehicleId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: driver.user.name,
    email: driver.user.email,
    phone: driver.user.phone || '',
  });

  const [notifications, setNotifications] = useState({
    newTrips: true,
    tripUpdates: true,
    earnings: true,
    promotions: false,
  });

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your driver account">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-slate-800 p-6">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <img
                    src={driver.user.avatar}
                    alt={driver.user.name}
                    className="w-20 h-20 rounded-xl border-4 border-background"
                  />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-primary-foreground pb-1">
                  <h2 className="text-xl font-bold">{driver.user.name}</h2>
                  <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                    <Star size={14} className="fill-warning text-warning" />
                    <span>{driver.rating} rating</span>
                    <span>•</span>
                    <span>{driver.totalTrips} trips</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Personal Information</h3>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Vehicle */}
          {vehicle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">Assigned Vehicle</h3>
              <div className="flex items-center gap-4">
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-24 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{vehicle.make} {vehicle.model}</h4>
                  <p className="text-sm text-muted-foreground">{vehicle.plateNumber} • {vehicle.year}</p>
                  <p className="text-sm text-muted-foreground capitalize">{vehicle.type} • {vehicle.seats} seats</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* License Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">License Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium text-foreground">{driver.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(driver.licenseExpiry).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield size={20} className="text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Verified Driver</h4>
                <p className="text-sm text-muted-foreground">All documents verified</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Identity</span>
                <span className="text-success">Verified ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">License</span>
                <span className="text-success">Verified ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Background Check</span>
                <span className="text-success">Verified ✓</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-foreground" />
              <h4 className="font-semibold text-foreground">Notifications</h4>
            </div>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-foreground mb-3">Quick Links</h4>
            <div className="space-y-2">
              {['Help Center', 'Terms of Service', 'Privacy Policy'].map((link) => (
                <button
                  key={link}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <span className="text-foreground">{link}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <Button variant="outline" className="w-full justify-start text-foreground">
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
