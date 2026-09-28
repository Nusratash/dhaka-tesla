import { RideStatus } from '@/lib/types';

const STYLES: Record<RideStatus, string> = {
  REQUESTED: 'badge-info',
  MATCHED: 'badge-primary',
  DRIVER_ARRIVED: 'badge-secondary',
  STARTED: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-error',
};

const LABELS: Record<RideStatus, string> = {
  REQUESTED: 'Requested',
  MATCHED: 'Matched',
  DRIVER_ARRIVED: 'Driver arrived',
  STARTED: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }: { status: RideStatus }) {
  return <span className={`badge ${STYLES[status]} badge-lg text-white font-medium`}>{LABELS[status]}</span>;
}
