import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from '../models/route.model';

@Injectable({
    providedIn: 'root'
})
export class RouteService {
    private apiUrl = '/api/routes';
    private http = inject(HttpClient);

    getAllRoutes(): Observable<Route[]> {
        return this.http.get<Route[]>(this.apiUrl);
    }

    createRoute(route: Route): Observable<Route> {
        return this.http.post<Route>(this.apiUrl, route);
    }

    updateRoute(id: number, route: Route): Observable<Route> {
        return this.http.put<Route>(`${this.apiUrl}/${id}`, route);
    }

    deleteRoute(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
