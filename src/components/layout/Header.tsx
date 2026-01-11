import { useState } from 'react';
import { Bell, Search, MessageSquare, X } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const mockNotifications = [
  { id: '1', title: 'Booking Confirmed', message: 'Your booking for tomorrow has been confirmed', time: '2 min ago', read: false },
  { id: '2', title: 'Driver Assigned', message: 'Emmanuel has been assigned to your trip', time: '1 hour ago', read: false },
  { id: '3', title: 'Payment Received', message: 'Your payment of ₦45,000 was successful', time: '3 hours ago', read: true },
];

const mockMessages = [
  { id: '1', sender: 'Emmanuel (Driver)', message: 'I will arrive in 10 minutes', time: '5 min ago', avatar: 'E' },
  { id: '2', sender: 'FleetMaster Nigeria', message: 'Your booking request has been accepted', time: '1 hour ago', avatar: 'F' },
];

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const { profile, roles } = useSupabaseAuth();
  const role = roles[0];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [messages] = useState(mockMessages);

  const roleLabels: Record<string, string> = {
    consumer: 'Consumer Portal',
    provider: 'Provider Dashboard',
    driver: 'Driver App',
    admin: 'Admin Console',
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast.info('Opening notification...');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleMessageClick = (message: typeof mockMessages[0]) => {
    setShowMessages(false);
    toast.info(`Opening chat with ${message.sender}`);
    // Navigate to bookings page where chat is available
    if (role === 'consumer') {
      navigate('/consumer/bookings');
    } else if (role === 'provider') {
      navigate('/provider/requests');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        toast.info(`Searching for "${value}"...`);
      }
    }
  };

  const handleProfileClick = () => {
    if (role === 'consumer') {
      navigate('/consumer/profile');
    } else if (role === 'provider') {
      navigate('/provider/settings');
    } else if (role === 'driver') {
      navigate('/driver/profile');
    } else if (role === 'admin') {
      navigate('/admin/settings');
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 relative">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {title || (role && roleLabels[role])}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mr-4">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-48"
            onKeyDown={handleSearch}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
            }}
            className="relative p-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell size={20} className="text-muted-foreground" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-accent-foreground flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-accent hover:underline"
                    >
                      Mark all read
                    </button>
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-accent/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                        )}
                        <div className={!notification.read ? '' : 'ml-5'}>
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border text-center">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      toast.info('View all notifications coming soon');
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
            }}
            className="relative p-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            <MessageSquare size={20} className="text-muted-foreground" />
            {messages.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-warning rounded-full text-[10px] font-bold text-warning-foreground flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Messages</h3>
                  <button onClick={() => setShowMessages(false)}>
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className="p-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium text-sm flex-shrink-0">
                          {message.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{message.sender}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{message.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border text-center">
                  <button 
                    onClick={() => {
                      setShowMessages(false);
                      if (role === 'consumer') {
                        navigate('/consumer/bookings');
                      } else if (role === 'provider') {
                        navigate('/provider/requests');
                      }
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    View all messages
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        {profile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProfileClick}
            className="ml-2 flex items-center gap-3 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium text-sm">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </motion.button>
        )}
      </div>
    </header>
  );
}
