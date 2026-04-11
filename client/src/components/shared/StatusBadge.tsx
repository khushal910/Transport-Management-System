import { cn } from '@/lib/utils';
import type { VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseStatus } from '@/types/fleet';

type StatusType = VehicleStatus | DriverStatus | TripStatus | MaintenanceStatus | ExpenseStatus;

const statusStyles: Record<string, string> = {
  available: 'bg-success/15 text-success',
  on_trip: 'bg-info/15 text-info',
  assigned: 'bg-warning/15 text-warning',
  in_shop: 'bg-destructive/15 text-destructive',
  retired: 'bg-muted text-muted-foreground',
  on_duty: 'bg-success/15 text-success',
  off_duty: 'bg-muted text-muted-foreground',
  suspended: 'bg-destructive/15 text-destructive',
  draft: 'bg-muted text-muted-foreground',
  dispatched: 'bg-info/15 text-info',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-destructive/15 text-destructive',
  pending: 'bg-warning/15 text-warning',
};

const statusLabels: Record<string, string> = {
  available: 'Available',
  on_trip: 'On Trip',
  assigned: 'Assigned',
  in_shop: 'In Shop',
  retired: 'Retired',
  on_duty: 'On Duty',
  off_duty: 'Off Duty',
  suspended: 'Suspended',
  draft: 'Draft',
  dispatched: 'Dispatched',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  return (
    <span className={cn('status-badge', statusStyles[status] || 'bg-muted text-muted-foreground', className)}>
      {statusLabels[status] || status}
    </span>
  );
}
