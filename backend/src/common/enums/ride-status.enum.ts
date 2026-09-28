// Applies to both the Pool (shared ride) and each individual RideRequest.
export enum RideStatus {
  REQUESTED = 'REQUESTED',
  MATCHED = 'MATCHED',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Explicit allow-list of legal transitions. Anything not listed here is
// rejected by RidesService.transition(), which is what actually enforces
// this server-side - this map only documents/drives that enforcement.
export const ALLOWED_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  [RideStatus.REQUESTED]: [RideStatus.MATCHED, RideStatus.CANCELLED],
  [RideStatus.MATCHED]: [RideStatus.DRIVER_ARRIVED, RideStatus.CANCELLED],
  [RideStatus.DRIVER_ARRIVED]: [RideStatus.STARTED, RideStatus.CANCELLED],
  [RideStatus.STARTED]: [RideStatus.COMPLETED],
  [RideStatus.COMPLETED]: [],
  [RideStatus.CANCELLED]: [],
};

export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
}
