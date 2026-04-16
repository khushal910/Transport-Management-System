import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
  href?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className, href }: KPICardProps) {
  const cardContent = (
    <div className={cn('kpi-card', href && 'cursor-pointer transition-all hover:shadow-lg hover:border-primary/30', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span className={cn('text-xs font-medium', trend.positive ? 'text-success' : 'text-destructive')}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{cardContent}</Link>;
  }

  return cardContent;
}
