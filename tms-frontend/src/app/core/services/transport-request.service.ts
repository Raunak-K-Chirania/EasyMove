import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransportRequest, TransportRequestStatus } from '../models/transport-request.model';

@Injectable({
  providedIn: 'root'
})
export class TransportRequestService {
  private apiUrl = '/api/transport-requests';

  constructor(private http: HttpClient) {}

  createRequest(request: Partial<TransportRequest>): Observable<TransportRequest> {
    return this.http.post<TransportRequest>(this.apiUrl, request);
  }

  getAllRequests(): Observable<TransportRequest[]> {
    return this.http.get<TransportRequest[]>(this.apiUrl);
  }

  getPendingRequests(): Observable<TransportRequest[]> {
    return this.http.get<TransportRequest[]>(`${this.apiUrl}/pending`);
  }

  getCustomerRequests(): Observable<TransportRequest[]> {
    return this.http.get<TransportRequest[]>(`${this.apiUrl}/customer`);
  }

  getDriverRequests(): Observable<TransportRequest[]> {
    return this.http.get<TransportRequest[]>(`${this.apiUrl}/driver`);
  }

  approveRequest(id: number): Observable<TransportRequest> {
    return this.http.put<TransportRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number, reason: string): Observable<TransportRequest> {
    let params = new HttpParams().set('reason', reason);
    return this.http.put<TransportRequest>(`${this.apiUrl}/${id}/reject`, {}, { params });
  }

  assignDriver(id: number, driverId: number, vehicleId: number): Observable<TransportRequest> {
    let params = new HttpParams()
      .set('driverId', driverId.toString())
      .set('vehicleId', vehicleId.toString());
    return this.http.put<TransportRequest>(`${this.apiUrl}/${id}/assign`, {}, { params });
  }

  updateTripStatus(id: number, status: TransportRequestStatus): Observable<TransportRequest> {
    let params = new HttpParams().set('status', status);
    return this.http.put<TransportRequest>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  cancelRequest(id: number, reason: string = ''): Observable<TransportRequest> {
    return this.http.put<TransportRequest>(`${this.apiUrl}/${id}/cancel?reason=${encodeURIComponent(reason)}`, {});
  }
}
