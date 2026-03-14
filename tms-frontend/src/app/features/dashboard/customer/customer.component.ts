import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <nav class="bg-emerald-700 p-4 text-white flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">TMS Customer Portal</h1>
        <button (click)="logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors">Logout</button>
      </nav>
      <main class="flex-grow p-8">
        <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 class="text-3xl font-semibold mb-2 text-gray-800">Welcome back!</h2>
          <p class="text-gray-500 mb-8">Ready to book your next shipment?</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <a routerLink="/customer/request-transport" class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <div class="bg-emerald-500 p-4 rounded-full mb-4 shadow-sm">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <h3 class="font-bold text-emerald-900 text-xl">Request Transport</h3>
              <p class="text-sm text-emerald-700 mt-2 text-center">Request a vehicle for your transport needs.</p>
            </a>
            <a routerLink="/customer/my-requests" class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <div class="bg-blue-500 p-4 rounded-full mb-4 shadow-sm">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              </div>
              <h3 class="font-bold text-blue-900 text-xl">My Requests</h3>
              <p class="text-sm text-blue-700 mt-2 text-center">Track your transport requests and history.</p>
            </a>
            <a routerLink="/customer/bookings" class="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md transition transform hover:-translate-y-1 block">
              <div class="bg-purple-500 p-4 rounded-full mb-4 shadow-sm">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 class="font-bold text-purple-900 text-xl">Old Bookings</h3>
              <p class="text-sm text-purple-700 mt-2 text-center">Legacy booking system.</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CustomerComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
