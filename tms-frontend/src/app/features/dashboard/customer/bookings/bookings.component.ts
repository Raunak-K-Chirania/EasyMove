import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../../core/services/booking.service';
import { RouteService } from '../../../../core/services/route.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Booking } from '../../../../core/models/booking.model';
import { Route } from '../../../../core/models/route.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-customer-bookings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DatePipe],
    templateUrl: './bookings.component.html'
})
export class BookingsComponent implements OnInit {
    bookings: Booking[] = [];
    availableRoutes: Route[] = [];
    bookingForm: FormGroup;
    showForm = false;
    selectedRoute: Route | null = null;
    errorMsg = '';
    selectedBookingForReceipt: Booking | null = null;
    selectedBookingForDetails: Booking | null = null;

    private bookingService = inject(BookingService);
    private routeService = inject(RouteService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    constructor() {
        this.bookingForm = this.fb.group({
            routeId: ['', Validators.required],
            bookingDate: ['', Validators.required],
            paymentMethod: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadBookings();
        this.loadRoutes();

        this.bookingForm.get('routeId')?.valueChanges.subscribe(routeId => {
            if (routeId) {
                this.selectedRoute = this.availableRoutes.find(r => r.id === Number(routeId)) || null;
            } else {
                this.selectedRoute = null;
            }
        });
    }

    loadBookings() {
        this.bookingService.getAllBookings().subscribe({
            next: (data: Booking[]) => {
                // Filter bookings to only show the current customer's bookings
                const currentUser = this.authService.currentUserValue;
                if (currentUser && currentUser.token) {
                    try {
                        const payload = JSON.parse(atob(currentUser.token.split('.')[1]));
                        const email = payload.sub; // The subject in the JWT is the email
                        this.bookings = data.filter((b: Booking) => b.customer?.email === email);
                    } catch (e) {
                        this.bookings = data;
                    }
                } else {
                    this.bookings = data;
                }
            },
            error: (err: any) => console.error('Error loading bookings', err)
        });
    }

    loadRoutes() {
        this.routeService.getAllRoutes().subscribe({
            next: (data: Route[]) => this.availableRoutes = data,
            error: (err: any) => console.error('Error loading routes', err)
        });
    }

    openNewForm() {
        this.bookingForm.reset();
        this.selectedRoute = null;
        this.errorMsg = '';
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
    }

    onSubmit() {
        if (this.bookingForm.invalid || !this.selectedRoute) return;

        let bDate = this.bookingForm.value.bookingDate;
        if (bDate && bDate.length === 16) {
            bDate += ':00';
        }

        const payload = {
            route: { id: this.selectedRoute.id },
            bookingDate: bDate,
            paymentMethod: this.bookingForm.value.paymentMethod,
            status: 'PENDING',
            totalCost: this.selectedRoute.cost
        };

        this.bookingService.createBooking(payload).subscribe({
            next: () => {
                this.loadBookings();
                this.closeForm();
            },
            error: (err: any) => {
                console.error('Error creating booking', err);
                if (err.status === 403) {
                    this.errorMsg = 'Forbidden: You do not have permission to book. Are you logged in as a CUSTOMER?';
                } else {
                    this.errorMsg = 'An error occurred while creating your booking.';
                }
            }
        });
    }

    openReceipt(booking: Booking) {
        this.selectedBookingForReceipt = booking;
    }

    closeReceipt() {
        this.selectedBookingForReceipt = null;
    }

    openDetails(booking: Booking) {
        this.selectedBookingForDetails = booking;
    }

    closeDetails() {
        this.selectedBookingForDetails = null;
    }

    printReceipt() {
        window.print();
    }
}
