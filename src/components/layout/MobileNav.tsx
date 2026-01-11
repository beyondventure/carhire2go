import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Clock, 
  CreditCard, 
  User, 
  LayoutDashboard,
  Users,
  Truck,
  Wallet,
  Bell,
  Navigation,
  BarChart3,
  Settings,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { UserRole } from '@/types';

const roleNavItems: Record<UserRole, Array<{ label: string; path: string; icon: LucideIcon }>> = {
  consumer: [
    { label: 'Home', path: '/consumer', icon: Home },
    { label: 'Book', path: '/consumer/book', icon: MapPin },
    { label: 'Bookings', path: '/consumer/bookings', icon: Clock },
    { label: 'Payments', path: '/consumer/payments', icon: CreditCard },
    { label: 'Profile', path: '/consumer/profile', icon: User },
  ],
  provider: [
    { label: 'Home', path: '/provider', icon: LayoutDashboard },
    { label: 'Requests', path: '/provider/requests', icon: Bell },
    { label: 'Fleet', path: '/provider/fleet', icon: Truck },
    { label: 'Drivers', path: '/provider/drivers', icon: Users },
    { label: 'Settings', path: '/provider/settings', icon: Settings },
  ],
  driver: [
    { label: 'Home', path: '/driver', icon: Home },
    { label: 'Trip', path: '/driver/trip', icon: Navigation },
    { label: 'Trips', path: '/driver/trips', icon: Clock },
    { label: 'Earnings', path: '/driver/earnings', icon: Wallet },
    { label: 'Profile', path: '/driver/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: Clock },
    { label: 'Providers', path: '/admin/providers', icon: Truck },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

export function MobileNav() {
  const location = useLocation();
  const { roles } = useSupabaseAuth();
  
  const role = roles[0] as UserRole | undefined;
  
  if (!role) return null;

  const navItems = roleNavItems[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative transition-colors',
                isActive ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon size={20} className={cn(isActive && 'text-accent')} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
