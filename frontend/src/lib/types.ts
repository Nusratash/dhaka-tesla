export type UserRole = 'passenger' | 'driver';

export type RideStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DRIVER_ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Zone {
  name: string;
  lat: number;
  lng: number;
  corridor: string;
}

export interface Fare {
  baseFarePoysha: number;
  distanceChargePoysha: number;
  poolDiscountPoysha: number;
  totalFarePoysha: number;
}

export interface Tesla {
  id: string;
  nickname: string;
  vehicleType: string;
  plateNumber: string;
  seatCapacity: number;
}

export interface Pool {
  id: string;
  status: RideStatus;
  seatsTaken: number;
  tesla: Tesla;
  requests?: RideRequest[];
  createdAt: string;
}

export interface RideRequest {
  id: string;
  pickupZone: string;
  destinationZone: string;
  seatsRequested: number;
  status: RideStatus;
  pool: Pool | null;
  fare: Fare | null;
  passenger?: { id: string; fullName: string };
  createdAt: string;
}

export function poyshaToBdt(poysha: number): string {
  return (poysha / 100).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
