import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { assignVehicleToDriver, removeVehicleFromDriver } from '@/api/driver';
import { getVehicleList } from '@/api/vehicle';
import { AlertCircle, Trash2, X, Loader2 } from 'lucide-react';
import type { EmployeeRecord } from '@/api/auth';

interface VehicleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeRecord | null;
  driverId: string | null;
}

interface FeedbackMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function VehicleAssignmentDialog({
  open,
  onOpenChange,
  employee,
  driverId,
}: VehicleAssignmentDialogProps) {
  const queryClient = useQueryClient();
  const [selectedVehicleId, setSelectedVehicleId] = React.useState('');
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedVehicleId('');
      setFeedback(null);
    }
  }, [open]);

  // Fetch available vehicles
  const { data: vehiclesData, isLoading: isVehiclesLoading } = useQuery({
    queryKey: ['vehicles', 'active'],
    queryFn: async () => {
      const result = await getVehicleList(1, 1000);
      return result.data?.vehicles ?? [];
    },
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const availableVehicles = vehiclesData?.filter((v) => v.status === 'available') ?? [];
  const assignedVehicle = (employee as any)?.assignedVehicle;

  // Assign vehicle mutation
  const assignVehicleMutation = useMutation({
    mutationFn: async () => {
      if (!driverId || !selectedVehicleId) return;
      return assignVehicleToDriver({
        driverId,
        vehicleId: selectedVehicleId,
      });
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Vehicle assigned successfully!' });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedVehicleId('');
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    },
    onError: (error: any) => {
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to assign vehicle',
      });
    },
  });

  // Remove vehicle mutation
  const removeVehicleMutation = useMutation({
    mutationFn: async () => {
      if (!driverId) return;
      return removeVehicleFromDriver({ driverId });
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Vehicle removed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    },
    onError: (error: any) => {
      setFeedback({
        type: 'error',
        message: error?.message || 'Failed to remove vehicle',
      });
    },
  });

  const handleAssign = () => {
    if (!selectedVehicleId) {
      setFeedback({ type: 'error', message: 'Please select a vehicle' });
      return;
    }
    assignVehicleMutation.mutate();
  };

  const handleRemove = () => {
    const confirmed = window.confirm(
      `Remove ${assignedVehicle?.registrationNumber || assignedVehicle?.licensePlate} from ${employee?.name}?`
    );
    if (confirmed) {
      removeVehicleMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Vehicle Assignment</DialogTitle>
        </DialogHeader>

        {employee ? (
          <div className="space-y-4">
            {/* Current assignment info */}
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium text-foreground">{employee.name}</p>
              {assignedVehicle ? (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Currently assigned:</span>{' '}
                    {assignedVehicle.registrationNumber || assignedVehicle.licensePlate || assignedVehicle.name}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No vehicle assigned</p>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`flex gap-2 rounded-lg border p-3 ${
                  feedback.type === 'error'
                    ? 'border-destructive/50 bg-destructive/10'
                    : 'border-emerald-200 bg-emerald-50'
                }`}
              >
                <AlertCircle
                  className={`h-4 w-4 flex-shrink-0 ${
                    feedback.type === 'error' ? 'text-destructive' : 'text-emerald-600'
                  }`}
                />
                <p
                  className={`text-sm ${
                    feedback.type === 'error'
                      ? 'text-destructive'
                      : 'text-emerald-600'
                  }`}
                >
                  {feedback.message}
                </p>
              </div>
            )}

            {/* Vehicle selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Select Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="vehicle-select" disabled={isVehiclesLoading}>
                  <SelectValue placeholder={isVehiclesLoading ? 'Loading vehicles...' : 'Choose a vehicle'} />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No active vehicles available</div>
                  ) : (
                    availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.name} ({vehicle.licensePlate}) - {vehicle.model}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              {assignedVehicle && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={removeVehicleMutation.isPending}
                  className="flex-1"
                >
                  {removeVehicleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Remove Current
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleAssign}
                disabled={
                  assignVehicleMutation.isPending ||
                  removeVehicleMutation.isPending ||
                  !selectedVehicleId
                }
                className="flex-1"
              >
                {assignVehicleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Vehicle'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={assignVehicleMutation.isPending || removeVehicleMutation.isPending}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
