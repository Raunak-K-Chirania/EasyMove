import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportRequestService } from '../../../../core/services/transport-request.service';
import { TransportRequest, TransportRequestStatus } from '../../../../core/models/transport-request.model';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReviewService } from '../../../../core/services/review.service';
import { FormsModule } from '@angular/forms';
import { TrackingMapComponent } from '../../../../shared/components/tracking-map/tracking-map.component';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TrackingMapComponent],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.css']
})
export class MyRequestsComponent implements OnInit {
  requests: TransportRequest[] = [];
  loading = true;
  error = '';
  isPaying = false;
  cancelLoadingId: number | null = null;
  trackingRequestId: number | null = null;

  constructor(
    private transportRequestService: TransportRequestService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {}

  // Review Modal State
  showReviewModal = false;
  selectedRequestForReview: TransportRequest | null = null;
  reviewRating = 5;
  reviewComment = '';
  isSubmittingReview = false;
  reviewedRequestIds: Set<number> = new Set();

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.transportRequestService.getCustomerRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
        this.fetchReviewStatus();
      },
      error: (err) => {
        this.error = 'Failed to load requests.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  fetchReviewStatus() {
    const completed = this.requests.filter(r => r.status === TransportRequestStatus.COMPLETED);
    completed.forEach(req => {
      this.reviewService.checkReviewExists(req.id).subscribe(res => {
        if (res.exists) {
          this.reviewedRequestIds.add(req.id);
        }
      });
    });
  }

  canCancel(request: TransportRequest): boolean {
    return request.status !== TransportRequestStatus.IN_PROGRESS && 
           request.status !== TransportRequestStatus.COMPLETED &&
           request.status !== TransportRequestStatus.CANCELLED;
  }

  onCancel(id: number) {
    const reason = prompt('Please enter a reason for cancellation (optional):');
    if (reason !== null) {
      this.cancelLoadingId = id;
      this.transportRequestService.cancelRequest(id, reason).subscribe({
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

  onPay(request: TransportRequest) {
    if (this.isPaying) return;
    this.isPaying = true;

    const userEmail = this.authService.currentUserValue?.email || 'customer@easymove.com';
    const amount = request.price || 0;

    this.paymentService.createOrder(amount, 'INR', userEmail).subscribe({
      next: (orderStr) => {
        const order = JSON.parse(orderStr);
        const options = {
          key: 'rzp_test_SRAHt303S4q5je',
          amount: order.amount,
          currency: order.currency,
          name: 'EasyMove Logistics',
          description: `Payment for Request #${request.id}`,
          order_id: order.id,
          prefill: { email: userEmail },
          handler: (response: any) => {
            this.paymentService.verifyPayment({
              order_id: order.id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            }).subscribe({
              next: () => {
                alert('Payment Successful!');
                this.loadRequests();
                this.isPaying = false;
              },
              error: (err) => {
                console.error('Verification failed', err);
                alert('Payment verification failed.');
                this.isPaying = false;
              }
            });
          },
          theme: { color: '#34d399' }
        };
        this.paymentService.openCheckout(options, () => {});
      },
      error: (err) => {
        this.isPaying = false;
        console.error('Order creation failed', err);
        alert('Failed to initiate payment.');
      }
    });
  }

  toggleTracking(requestId: number) {
    if (this.trackingRequestId === requestId) {
      this.trackingRequestId = null;
    } else {
      this.trackingRequestId = requestId;
    }
  }

  openReviewModal(request: TransportRequest) {
    this.selectedRequestForReview = request;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedRequestForReview = null;
  }

  submitReview() {
    if (!this.selectedRequestForReview || !this.selectedRequestForReview.driverId) return;
    
    this.isSubmittingReview = true;
    const reviewData = {
      transportRequestId: this.selectedRequestForReview.id,
      customerId: this.authService.currentUserValue?.id || 0,
      driverId: this.selectedRequestForReview.driverId,
      rating: this.reviewRating,
      comment: this.reviewComment
    };

    this.reviewService.submitReview(reviewData).subscribe({
      next: () => {
        alert('Thank you for your review!');
        this.reviewedRequestIds.add(this.selectedRequestForReview!.id);
        this.isSubmittingReview = false;
        this.closeReviewModal();
      },
      error: (err) => {
        console.error('Failed to submit review', err);
        alert('Failed to submit review. Maybe you already reviewed this trip?');
        this.isSubmittingReview = false;
      }
    });
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
