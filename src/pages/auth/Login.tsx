import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Car, User, Briefcase, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const testAccounts = [
  { email: 'user@carhire2go.ng', role: 'consumer', label: 'Consumer', icon: User, color: 'bg-foreground' },
  { email: 'provider@carhire2go.ng', role: 'provider', label: 'Provider', icon: Briefcase, color: 'bg-foreground' },
  { email: 'driver@carhire2go.ng', role: 'driver', label: 'Driver', icon: Users, color: 'bg-foreground' },
  { email: 'admin@carhire2go.ng', role: 'admin', label: 'Admin', icon: Shield, color: 'bg-foreground' },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRoleBasedRoute = async (userId: string): Promise<string> => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const role = roles?.[0]?.role;
    
    switch (role) {
      case 'admin': return '/admin';
      case 'provider': return '/provider';
      case 'driver': return '/driver';
      default: return '/consumer';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // Get current user and redirect based on role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const route = await getRoleBasedRoute(user.id);
      toast.success('Welcome back!');
      navigate(route);
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = async (testEmail: string) => {
    setIsLoading(true);
    const { error } = await signIn(testEmail, 'testtest123');
    
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const route = await getRoleBasedRoute(user.id);
      toast.success('Welcome back!');
      navigate(route);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="text-center text-white space-y-6">
          <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center"
          >
            <Car size={40} />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold"
          >
            InstantRyde
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/80 max-w-md"
          >
            Your premium car hire platform connecting consumers with trusted providers and professional drivers.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <Car size={20} className="text-background" />
              </div>
              <span className="text-xl font-bold">InstantRyde</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          {/* Quick Login Buttons for Demo */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((account) => {
                const IconComponent = account.icon;
                return (
                  <motion.button
                    key={account.role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickLogin(account.email)}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-accent/30 bg-card text-left transition-all disabled:opacity-50"
                  >
                    <div className={`w-8 h-8 rounded-lg ${account.color} flex items-center justify-center text-white`}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{account.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign in manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-foreground font-semibold hover:underline">
                Sign up
              </Link>
            </p>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
