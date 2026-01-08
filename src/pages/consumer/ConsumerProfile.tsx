import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Bell, ChevronRight, Camera, LogOut } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { mockUsers } from '@/lib/mock-data';

export default function ConsumerProfile() {
  const user = mockUsers.consumer1;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
  });

  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    promotions: false,
    priceAlerts: true,
    driverArrival: true,
  });

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account settings">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-slate-800 p-6">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-xl border-4 border-background"
                  />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-primary-foreground pb-1">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-primary-foreground/70 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
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

          {/* Saved Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Saved Locations</h3>
              <Button variant="ghost" size="sm">Add New</Button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Home', address: 'Lekki Phase 1, Lagos' },
                { label: 'Work', address: 'Victoria Island, Lagos' },
              ].map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{location.label}</p>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              ))}
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
                <h4 className="font-semibold text-foreground">Verified Account</h4>
                <p className="text-sm text-muted-foreground">Email & Phone verified</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="text-success">Verified ✓</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
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

          {/* Danger Zone */}
          <div className="bg-card rounded-xl border border-destructive/20 p-5">
            <h4 className="font-semibold text-foreground mb-3">Account Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-foreground">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
