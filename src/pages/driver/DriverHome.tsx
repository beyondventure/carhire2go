import { motion } from 'framer-motion';
import { Navigation, MapPin, Clock, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingMap } from '@/components/map/BookingMap';
import { mockBookings } from '@/lib/mock-data';
import { CURRENCY } from '@/lib/constants';

export default function DriverHome() {
  const activeTrip = mockBookings.find(b => b.status === 'in-progress');

  return (
    <DashboardLayout title="Driver Dashboard">
      {activeTrip ? (
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          <BookingMap pickup={activeTrip.pickup} dropoff={activeTrip.dropoff} className="h-full min-h-[400px]" />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 text-success mb-4"><div className="w-3 h-3 rounded-full bg-success animate-pulse" /><span className="font-medium">Active Trip</span></div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3"><div className="w-3 h-3 rounded-full bg-success mt-1.5" /><div><p className="font-medium text-foreground">{activeTrip.pickup.name}</p><p className="text-sm text-muted-foreground">Pickup</p></div></div>
              <div className="flex items-start gap-3"><div className="w-3 h-3 rounded-full bg-destructive mt-1.5" /><div><p className="font-medium text-foreground">{activeTrip.dropoff.name}</p><p className="text-sm text-muted-foreground">Drop-off</p></div></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-6">
              <div><p className="text-sm text-muted-foreground">Customer</p><p className="font-medium text-foreground">{activeTrip.consumer?.name}</p></div>
              <button className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center"><Phone size={20} /></button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full py-4"><CheckCircle2 size={20} />Complete Trip</motion.button>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"><Navigation size={32} className="text-muted-foreground" /></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Active Trip</h2>
          <p className="text-muted-foreground">You'll be notified when a new trip is assigned</p>
        </div>
      )}
    </DashboardLayout>
  );
}
