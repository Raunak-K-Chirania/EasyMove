import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = '/api/bookings';
    private http = inject(HttpClient);

    getAllBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.apiUrl);
    }

    createBooking(booking: any): Observable<Booking> {
        return this.http.post<Booking>(this.apiUrl, booking);
    }

    updateBookingStatus(id: number, status: string): Observable<Booking> {
        return this.http.patch<Booking>(`${this.apiUrl}/${id}/status?status=${status}`, {});
    }
}
