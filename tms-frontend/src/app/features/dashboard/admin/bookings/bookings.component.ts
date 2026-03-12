import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../../core/services/booking.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { UserService } from '../../../../core/services/user.service';
import { TripService } from '../../../../core/services/trip.service';
import { Booking } from '../../../../core/models/booking.model';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { Trip } from '../../../../core/models/trip.model';

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DatePipe],
    templateUrl: './bookings.component.html'
})
export class AdminBookingsComponent implements OnInit {
    bookings: Booking[] = [];
    trips: Trip[] = [];
    availableVehicles: Vehicle[] = [];
    drivers: User[] = [];

    assignForm: FormGroup;
    showAssignModal = false;
    selectedBookingId: number | null = null;
    errorMsg = '';

    private bookingService = inject(BookingService);
    private vehicleService = inject(VehicleService);
    private userService = inject(UserService);
    private tripService = inject(TripService);
    private fb = inject(FormBuilder);

    constructor() {
        this.assignForm = this.fb.group({
            vehicleId: ['', Validators.required],
            driverId: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.bookingService.getAllBookings().subscribe({
            next: (data: Booking[]) => this.bookings = data,
            error: (err: any) => console.error('Error loading bookings', err)
        });

        this.tripService.getAllTrips().subscribe({
            next: (data: Trip[]) => this.trips = data,
            error: (err: any) => console.error('Error loading trips', err)
        });

        this.vehicleService.getAllVehicles().subscribe({
            next: (data: Vehicle[]) => this.availableVehicles = data.filter((v: Vehicle) => v.status === 'AVAILABLE'),
            error: (err: any) => console.error('Error loading vehicles', err)
        });

        this.userService.getDrivers().subscribe({
            next: (data: User[]) => this.drivers = data,
            error: (err: any) => console.error('Error loading drivers', err)
        });
    }

    openAssignModal(bookingId: number) {
        this.selectedBookingId = bookingId;
        this.assignForm.reset();
        this.errorMsg = '';
        this.showAssignModal = true;
    }

    closeModal() {
        this.showAssignModal = false;
        this.selectedBookingId = null;
    }

    getTripForBooking(bookingId: number): Trip | undefined {
        return this.trips.find(t => t.booking.id === bookingId);
    }

    onAssign() {
        if (this.assignForm.invalid || !this.selectedBookingId) return;

        const payload = {
            booking: { id: this.selectedBookingId },
            vehicle: { id: Number(this.assignForm.value.vehicleId) },
            driver: { id: Number(this.assignForm.value.driverId) },
            status: 'SCHEDULED'
        };

        this.tripService.createTrip(payload).subscribe({
            next: () => {
                this.loadData(); // Reload to get updated bookings and trips
                this.closeModal();
            },
            error: (err: any) => {
                console.error('Error assigning trip', err);
                this.errorMsg = 'Failed to assign Driver and Vehicle. Ensure you have the right permissions.';
            }
        });
    }

    updateBookingStatus(id: number, status: string) {
        if (confirm(`Are you sure you want to mark this booking as ${status}?`)) {
            this.bookingService.updateBookingStatus(id, status).subscribe({
                next: () => this.loadData(),
                error: (err: any) => alert('Failed to update booking status')
            });
        }
    }
}
