export interface Review {
  id?: number;
  transportRequestId: number;
  customerId: number;
  driverId: number;
  rating: number; // 1 to 5
  comment: string;
  createdAt?: string;
}
