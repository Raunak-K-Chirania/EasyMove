import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-driver-dashboard',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink],
    templateUrl: './driver.component.html'
})
export class DriverComponent implements OnInit {
    userName: string = 'Driver';

    private authService = inject(AuthService);

    ngOnInit() {
        const user = this.authService.currentUserValue;
        if (user && user.token) {
            try {
                const payload = JSON.parse(atob(user.token.split('.')[1]));
                this.userName = payload.sub.split('@')[0]; // Using email prefix as name
            } catch (e) { }
        }
    }

    logout() {
        this.authService.logout();
    }
}
