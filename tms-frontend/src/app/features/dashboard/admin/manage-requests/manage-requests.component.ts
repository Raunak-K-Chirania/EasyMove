import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportRequestService } from '../../../../core/services/transport-request.service';
import { UserService } from '../../../../core/services/user.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { TransportRequest, TransportRequestStatus } from '../../../../core/models/transport-request.model';
import { User } from '../../../../core/models/user.model';
import { Vehicle } from '../../../../core/models/vehicle.model';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-requests.component.html',
  styleUrls: ['./manage-requests.component.css']
})
export class ManageRequestsComponent implements OnInit {
  requests: TransportRequest[] = [];
  drivers: User[] = [];
  vehicles: Vehicle[] = [];
  
  loading = true;
  error = '';
  
  // Modals state
  showRejectModal = false;
  showAssignModal = false;
  
  selectedRequest: TransportRequest | null = null;
  rejectionReason = '';
  
  selectedDriverId: number | null = null;
  selectedVehicleId: number | null = null;
  actionLoading = false;

  constructor(
    private transportRequestService: TransportRequestService,
    private userService: UserService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadDriversAndVehicles();
  }

  loadRequests() {
    this.loading = true;
    this.transportRequestService.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load requests.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadDriversAndVehicles() {
    this.userService.getDrivers().subscribe(data => this.drivers = data);
    this.vehicleService.getAllVehicles().subscribe(data => this.vehicles = data);
  }

  approveRequest(id: number) {
    if (confirm('Are you sure you want to approve this request?')) {
      this.transportRequestService.approveRequest(id).subscribe({
        next: (updated) => this.updateRequestInList(updated),
        error: (err) => alert('Failed to approve request')
      });
    }
  }

  openRejectModal(request: TransportRequest) {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  confirmReject() {
    if (!this.selectedRequest || !this.rejectionReason.trim()) return;
    this.actionLoading = true;
    this.transportRequestService.rejectRequest(this.selectedRequest.id, this.rejectionReason).subscribe({
      next: (updated) => {
        this.updateRequestInList(updated);
        this.closeModals();
      },
      error: (err) => {
        alert('Failed to reject request');
        this.actionLoading = false;
      }
    });
  }

  openAssignModal(request: TransportRequest) {
    this.selectedRequest = request;
    this.selectedDriverId = null;
    this.selectedVehicleId = null;
    this.showAssignModal = true;
  }

  confirmAssign() {
    if (!this.selectedRequest || !this.selectedDriverId || !this.selectedVehicleId) return;
    this.actionLoading = true;
    this.transportRequestService.assignDriver(this.selectedRequest.id, this.selectedDriverId, this.selectedVehicleId).subscribe({
      next: (updated) => {
        this.updateRequestInList(updated);
        this.closeModals();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to assign driver. Ensure request is APPROVED.');
        this.actionLoading = false;
      }
    });
  }

  closeModals() {
    this.showRejectModal = false;
    this.showAssignModal = false;
    this.selectedRequest = null;
    this.actionLoading = false;
  }

  private updateRequestInList(updated: TransportRequest) {
    const index = this.requests.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      this.requests[index] = updated;
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
