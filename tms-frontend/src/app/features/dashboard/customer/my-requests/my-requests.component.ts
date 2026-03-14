import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportRequestService } from '../../../../core/services/transport-request.service';
import { TransportRequest, TransportRequestStatus } from '../../../../core/models/transport-request.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.css']
})
export class MyRequestsComponent implements OnInit {
  requests: TransportRequest[] = [];
  loading = true;
  error = '';
  cancelLoadingId: number | null = null;

  constructor(private transportRequestService: TransportRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.transportRequestService.getCustomerRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load requests.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  canCancel(request: TransportRequest): boolean {
    return request.status !== TransportRequestStatus.IN_PROGRESS && 
           request.status !== TransportRequestStatus.COMPLETED &&
           request.status !== TransportRequestStatus.CANCELLED;
  }

  onCancel(id: number) {
    if (confirm('Are you sure you want to cancel this transport request?')) {
      this.cancelLoadingId = id;
      this.transportRequestService.cancelRequest(id).subscribe({
        next: (updated) => {
          const index = this.requests.findIndex(r => r.id === id);
          if (index !== -1) {
            this.requests[index] = updated;
          }
          this.cancelLoadingId = null;
        },
        error: (err) => {
          console.error('Failed to cancel request:', err);
          alert('Failed to cancel request. Please try again.');
          this.cancelLoadingId = null;
        }
      });
    }
  }

  getStatusClass(status: TransportRequestStatus): string {
    switch (status) {
      case TransportRequestStatus.PENDING: return 'badge-warning';
      case TransportRequestStatus.APPROVED: return 'badge-info';
      case TransportRequestStatus.REJECTED: return 'badge-danger';
      case TransportRequestStatus.ASSIGNED: return 'badge-primary';
      case TransportRequestStatus.IN_PROGRESS: return 'badge-primary';
      case TransportRequestStatus.DELAYED: return 'badge-warning';
      case TransportRequestStatus.COMPLETED: return 'badge-success';
      case TransportRequestStatus.CANCELLED: return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }
}
