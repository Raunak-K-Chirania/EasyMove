import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private apiUrl = '/api/trips';
    private http = inject(HttpClient);

    getAllTrips(): Observable<Trip[]> {
        return this.http.get<Trip[]>(this.apiUrl);
    }

    createTrip(trip: any): Observable<Trip> {
        return this.http.post<Trip>(this.apiUrl, trip);
    }

    updateTripStatus(id: number, status: string): Observable<Trip> {
        return this.http.put<Trip>(`${this.apiUrl}/${id}/status/${status}`, null);
    }
}
