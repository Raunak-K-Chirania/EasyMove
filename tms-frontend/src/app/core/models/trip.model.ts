import { Booking } from './booking.model';
import { Vehicle } from './vehicle.model';
import { User } from './user.model';

export interface Trip {
    id?: number;
    booking: Booking;
    vehicle: Vehicle;
    driver: User;
    status: string; // SCHEDULED, IN_TRANSIT, DELIVERED
}
