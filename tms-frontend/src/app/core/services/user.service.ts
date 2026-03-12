import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = '/api/users';
    private http = inject(HttpClient);

    getDrivers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/drivers`);
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    updateRole(userId: number, role: string): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${userId}/role`, `"${role}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${userId}`);
    }
}
