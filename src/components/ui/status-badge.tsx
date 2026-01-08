import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type StatusType = 'active' | 'pending' | 'completed' | 'cancelled' | 'available' | 'unavailable' | 'verified' | 'unverified';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  'in-progress': { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  completed: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  pending: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  matching: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  negotiating: { bg: 'bg-secondary/20', text: 'text-secondary', dot: 'bg-secondary' },
  confirmed: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  cancelled: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
  available: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  unavailable: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  verified: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  unverified: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  
  const displayStatus = status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {displayStatus}
    </motion.span>
  );
}
