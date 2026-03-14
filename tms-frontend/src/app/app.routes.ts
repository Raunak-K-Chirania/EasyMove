import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminComponent } from './features/dashboard/admin/admin.component';
import { CustomerComponent } from './features/dashboard/customer/customer.component';
import { authGuard } from './core/guards/auth.guard';

import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
    },
    {
        path: 'admin/vehicles',
        loadComponent: () => import('./features/dashboard/admin/vehicles/vehicles.component').then(m => m.VehiclesComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
    },
    {
        path: 'admin/routes',
        loadComponent: () => import('./features/dashboard/admin/routes/routes.component').then(m => m.RoutesComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
    },
    {
        path: 'admin/bookings',
        loadComponent: () => import('./features/dashboard/admin/bookings/bookings.component').then(m => m.AdminBookingsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
    },
    {
        path: 'admin/users',
        loadComponent: () => import('./features/dashboard/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
    },
    {
        path: 'admin/requests',
        loadComponent: () => import('./features/dashboard/admin/manage-requests/manage-requests.component').then(m => m.ManageRequestsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
    },
    {
        path: 'customer',
        component: CustomerComponent,
        canActivate: [authGuard],
        data: { roles: ['CUSTOMER'] }
    },
    {
        path: 'customer/bookings',
        loadComponent: () => import('./features/dashboard/customer/bookings/bookings.component').then(m => m.BookingsComponent),
        canActivate: [authGuard],
        data: { roles: ['CUSTOMER'] }
    },
    {
        path: 'customer/request-transport',
        loadComponent: () => import('./features/dashboard/customer/request-transport/request-transport.component').then(m => m.RequestTransportComponent),
        canActivate: [authGuard],
        data: { roles: ['CUSTOMER'] }
    },
    {
        path: 'customer/my-requests',
        loadComponent: () => import('./features/dashboard/customer/my-requests/my-requests.component').then(m => m.MyRequestsComponent),
        canActivate: [authGuard],
        data: { roles: ['CUSTOMER'] }
    },
    {
        path: 'driver',
        loadComponent: () => import('./features/dashboard/driver/driver.component').then(m => m.DriverComponent),
        canActivate: [authGuard],
        data: { roles: ['DRIVER'] },
        children: [
            { path: 'trips', loadComponent: () => import('./features/dashboard/driver/assigned-trips/assigned-trips.component').then(m => m.AssignedTripsComponent) },
            { path: '', redirectTo: 'trips', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '' }
];
