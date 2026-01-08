import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor,
  className,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const variantStyles = {
    default: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('metric-card group cursor-pointer hover:border-accent/30 transition-all', className)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
          iconColor || variantStyles[variant]
        )}>
          <Icon size={22} />
        </div>
        {change && (
          <span className={cn('text-sm font-medium', changeColors[changeType])}>
            {change}
          </span>
        )}
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </motion.div>
  );
}
