export interface Vehicle {
    id?: number;
    registrationNumber: string;
    type: string;
    capacity: number;
    status: string; // e.g., 'AVAILABLE', 'ON_TRIP', 'MAINTENANCE'
}
