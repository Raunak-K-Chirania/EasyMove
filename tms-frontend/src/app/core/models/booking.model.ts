import { Route } from './route.model';

export interface Booking {
    id?: number;
    customer?: any; // To hold user response
    route: Route;
    status: string; // PENDING, CONFIRMED, COMPLETED, CANCELLED
    totalCost: number;
    paymentMethod?: string;
    bookingDate?: string;
}
