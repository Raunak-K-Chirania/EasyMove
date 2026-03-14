import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportRequestService } from '../../../../core/services/transport-request.service';
import { TransportRequest, TransportRequestStatus } from '../../../../core/models/transport-request.model';

@Component({
  selector: 'app-assigned-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assigned-trips.component.html',
  styleUrls: ['./assigned-trips.component.css']
})
export class AssignedTripsComponent implements OnInit {
  trips: TransportRequest[] = [];
  loading = true;
  error = '';
  updatingStatusId: number | null = null;

  constructor(private transportRequestService: TransportRequestService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips() {
    this.loading = true;
    this.transportRequestService.getDriverRequests().subscribe({
      next: (data) => {
        // Sort: active trips first
        this.trips = data.sort((a, b) => {
          if (a.status === TransportRequestStatus.IN_PROGRESS) return -1;
          if (b.status === TransportRequestStatus.IN_PROGRESS) return 1;
          return 0;
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assigned trips.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updateStatus(id: number, statusStr: string) {
    if (confirm(`Are you sure you want to mark this trip as ${statusStr}?`)) {
      this.updatingStatusId = id;
      const status = statusStr as TransportRequestStatus;
      this.transportRequestService.updateTripStatus(id, status).subscribe({
        next: (updated) => {
          const index = this.trips.findIndex(t => t.id === id);
          if (index !== -1) {
            this.trips[index] = updated;
          }
          this.updatingStatusId = null;
        },
        error: (err) => {
          alert('Failed to update trip status. Please try again.');
          this.updatingStatusId = null;
        }
      });
    }
  }

  getStatusClass(status: TransportRequestStatus): string {
    switch (status) {
      case TransportRequestStatus.ASSIGNED: return 'badge-primary';
      case TransportRequestStatus.IN_PROGRESS: return 'badge-warning';
      case TransportRequestStatus.DELAYED: return 'badge-danger';
      case TransportRequestStatus.COMPLETED: return 'badge-success';
      case TransportRequestStatus.CANCELLED: return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }
}
