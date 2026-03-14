import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  private authService = inject(AuthService);
  role = this.authService.currentUserValue?.role || 'Admin';

  logout() {
    this.authService.logout();
  }
}
