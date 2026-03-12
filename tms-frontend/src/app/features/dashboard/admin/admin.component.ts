import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <nav class="bg-blue-800 p-4 text-white flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">TMS Admin Dashboard</h1>
        <button (click)="logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors">Logout</button>
      </nav>
      <main class="flex-grow p-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Welcome, {{ role }}!</h2>
          <p class="text-gray-600">This is the central dashboard for managing vehicles, routes, and overall system status.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <a routerLink="/admin/vehicles" class="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <h3 class="font-bold text-blue-800 text-lg">Manage Vehicles</h3>
              <p class="text-sm text-blue-600 mt-2">Add, update, or remove vehicles from the fleet.</p>
            </a>
            <a routerLink="/admin/routes" class="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <h3 class="font-bold text-green-800 text-lg">Manage Routes</h3>
              <p class="text-sm text-green-600 mt-2">Configure transport routes and pricing.</p>
            </a>
            <a routerLink="/admin/bookings" class="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <h3 class="font-bold text-purple-800 text-lg">View Bookings</h3>
              <p class="text-sm text-purple-600 mt-2">Monitor active and past customer bookings.</p>
            </a>
            <a *ngIf="role === 'ADMIN'" routerLink="/admin/users" class="bg-red-50 p-6 rounded-lg border border-red-100 shadow-sm cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <h3 class="font-bold text-red-800 text-lg">Manage Users</h3>
              <p class="text-sm text-red-600 mt-2">Manage roles and User accounts.</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AdminComponent {
  private authService = inject(AuthService);
  role = this.authService.currentUserValue?.role || 'Admin';

  logout() {
    this.authService.logout();
  }
}
