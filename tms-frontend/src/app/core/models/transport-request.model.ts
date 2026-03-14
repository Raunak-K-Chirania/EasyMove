export enum TransportRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface TransportRequest {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  preferredTime?: string;
  specialInstructions?: string;
  distanceKm?: number;
  price?: number;
  routeId?: number;
  status: TransportRequestStatus;
  rejectionReason?: string;
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  createdAt: string;
  updatedAt: string;
}
