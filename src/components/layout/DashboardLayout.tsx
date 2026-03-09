import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DashboardSkeleton } from './DashboardSkeleton';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  mobileContentClassName?: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  isLoading,
  mobileContentClassName,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const isMobile = useIsMobile();

  // Show skeleton while auth is loading or explicit isLoading prop
  const showSkeleton = authLoading || isLoading;

  if (!user && !authLoading) {
    return <>{children}</>;
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Header title={showSkeleton ? undefined : title} subtitle={showSkeleton ? undefined : subtitle} isMobile />
        <main className={cn('flex-1 overflow-y-auto px-4 pt-4 pb-2', mobileContentClassName)}>
          {showSkeleton ? (
            <DashboardSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </main>
        <MobileNav />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col"
      >
        <Header title={showSkeleton ? undefined : title} subtitle={showSkeleton ? undefined : subtitle} />
        <div className="flex-1 p-6">
          {showSkeleton ? (
            <DashboardSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
}

