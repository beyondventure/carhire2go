import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const demoAccounts = [
  { email: 'user@instantryde.ng', password: 'testtest123', role: 'consumer', label: 'Consumer', color: 'bg-blue-500' },
  { email: 'provider@instantryde.ng', password: 'testtest123', role: 'provider', label: 'Provider', color: 'bg-green-500' },
  { email: 'driver@instantryde.ng', password: 'testtest123', role: 'driver', label: 'Driver', color: 'bg-amber-500' },
  { email: 'admin@instantryde.ng', password: 'testtest123', role: 'admin', label: 'Admin', color: 'bg-purple-500' },
];

interface DemoAccountSwitcherProps {
  currentEmail?: string;
  currentRole?: string;
}

export function DemoAccountSwitcher({ currentEmail, currentRole }: DemoAccountSwitcherProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const currentAccount = demoAccounts.find(a => a.email === currentEmail);

  const handleSwitchAccount = async (account: typeof demoAccounts[0]) => {
    if (account.email === currentEmail) {
      setIsOpen(false);
      return;
    }

    setIsLoading(account.email);
    
    try {
      // Sign out first
      await supabase.auth.signOut();
      
      // Sign in with the new account
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) throw error;

      toast.success(`Switched to ${account.label} account`);
      setIsOpen(false);
      
      // Navigate to the appropriate dashboard
      const routes: Record<string, string> = {
        consumer: '/consumer',
        provider: '/provider',
        driver: '/driver',
        admin: '/admin',
      };
      
      navigate(routes[account.role] || '/');
      
    } catch (error: any) {
      console.error('Switch account error:', error);
      toast.error(error.message || 'Failed to switch account');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${currentAccount?.color || 'bg-gray-500'}`} />
        <span className="text-xs font-medium text-foreground">
          {currentAccount?.label || currentRole || 'Demo'}
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Switch Demo Account</span>
                </div>
              </div>
              
              <div className="p-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSwitchAccount(account)}
                    disabled={isLoading !== null}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      account.email === currentEmail 
                        ? 'bg-accent/10 text-accent' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${account.color}`} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{account.label}</p>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                    </div>
                    {isLoading === account.email && (
                      <Loader2 size={14} className="animate-spin text-muted-foreground" />
                    )}
                    {account.email === currentEmail && !isLoading && (
                      <span className="text-xs text-accent">Active</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  Demo mode • Password: testtest123
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
