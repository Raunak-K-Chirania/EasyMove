import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  submitReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  getDriverReviews(driverId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/driver/${driverId}`);
  }

  getAverageRatingDetails(driverId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/driver/${driverId}/average`);
  }

  checkReviewExists(requestId: number): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check/${requestId}`);
  }
}
