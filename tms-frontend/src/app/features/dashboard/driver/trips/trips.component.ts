import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripService } from '../../../../core/services/trip.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Trip } from '../../../../core/models/trip.model';

@Component({
    selector: 'app-driver-trips',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './trips.component.html'
})
export class DriverTripsComponent implements OnInit {
    trips: Trip[] = [];
    userEmail: string = '';

    private tripService = inject(TripService);
    private authService = inject(AuthService);

    ngOnInit() {
        this.extractEmail();
        this.loadMyTrips();
    }

    private extractEmail() {
        const user = this.authService.currentUserValue;
        if (user && user.token) {
            try {
                const payload = JSON.parse(atob(user.token.split('.')[1]));
                this.userEmail = payload.sub;
            } catch (e) { }
        }
    }

    loadMyTrips() {
        this.tripService.getAllTrips().subscribe({
            next: (data: Trip[]) => {
                // Filter trips assigned to this driver
                this.trips = data.filter(t => t.driver?.email === this.userEmail);
            },
            error: (err: any) => console.error('Error loading trips', err)
        });
    }

    updateStatus(id: number | undefined, newStatus: string) {
        if (!id) return;

        if (confirm(`Update this shipment to ${newStatus}?`)) {
            this.tripService.updateTripStatus(id, newStatus).subscribe({
                next: () => this.loadMyTrips(),
                error: (err: any) => alert('Failed to update status')
            });
        }
    }
}
