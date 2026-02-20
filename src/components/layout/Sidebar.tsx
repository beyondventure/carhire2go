import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Car, 
  MapPin, 
  Clock, 
  CreditCard, 
  User, 
  Settings,
  LayoutDashboard,
  Users,
  Truck,
  BarChart3,
  Wallet,
  FileText,
  Shield,
  Navigation,
  MessageSquare,
  Bell,
  LogOut,
  ChevronLeft,
  Menu,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { PLATFORM_NAME } from '@/lib/constants';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const roleNavItems: Record<UserRole, Array<{ label: string; path: string; icon: React.ReactNode; badge?: number }>> = {
  consumer: [
    { label: 'Home', path: '/consumer', icon: <Home size={20} /> },
    { label: 'Book a Ride', path: '/consumer/book', icon: <MapPin size={20} /> },
    { label: 'My Bookings', path: '/consumer/bookings', icon: <Clock size={20} />, badge: 2 },
    { label: 'Payments', path: '/consumer/payments', icon: <CreditCard size={20} /> },
    { label: 'Profile', path: '/consumer/profile', icon: <User size={20} /> },
  ],
  provider: [
    { label: 'Dashboard', path: '/provider', icon: <LayoutDashboard size={20} /> },
    { label: 'Booking Requests', path: '/provider/requests', icon: <Bell size={20} />, badge: 3 },
    { label: 'Fleet', path: '/provider/fleet', icon: <Truck size={20} /> },
    { label: 'Drivers', path: '/provider/drivers', icon: <Users size={20} /> },
    { label: 'Earnings', path: '/provider/earnings', icon: <Wallet size={20} /> },
    { label: 'Settings', path: '/provider/settings', icon: <Settings size={20} /> },
  ],
  driver: [
    { label: 'Home', path: '/driver', icon: <Home size={20} /> },
    { label: 'Active Trip', path: '/driver/trip', icon: <Navigation size={20} /> },
    { label: 'My Trips', path: '/driver/trips', icon: <Clock size={20} /> },
    { label: 'Earnings', path: '/driver/earnings', icon: <Wallet size={20} /> },
    { label: 'Profile', path: '/driver/profile', icon: <User size={20} /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Bookings', path: '/admin/bookings', icon: <Car size={20} /> },
    { label: 'Providers', path: '/admin/providers', icon: <Truck size={20} /> },
    { label: 'Consumers', path: '/admin/consumers', icon: <Users size={20} /> },
    { label: 'Settlements', path: '/admin/settlements', icon: <CreditCard size={20} /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { label: 'Verification', path: '/admin/verification', icon: <Shield size={20} /> },
    { label: 'Architecture', path: '/admin/architecture', icon: <Layers size={20} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ],
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, signOut } = useSupabaseAuth();

  // Get the primary role (first role in array)
  const role = roles[0] as UserRole | undefined;

  if (!role) return null;

  const navItems = roleNavItems[role];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <Car size={20} className="text-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">{PLATFORM_NAME}</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-xl bg-white flex items-center justify-center">
            <Car size={20} className="text-foreground" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <span className={cn(isActive && 'text-sidebar-primary')}>{item.icon}</span>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-white text-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full"
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {profile && (
          <div className={cn('flex items-center gap-3 p-2', collapsed && 'justify-center')}>
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-medium">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{role}</p>
              </motion.div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
