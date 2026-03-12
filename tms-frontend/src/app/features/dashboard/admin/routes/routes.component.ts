import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouteService } from '../../../../core/services/route.service';
import { MapRoutingService } from '../../../../core/services/map-routing.service';
import { Route } from '../../../../core/models/route.model';

@Component({
    selector: 'app-admin-routes',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './routes.component.html'
})
export class RoutesComponent implements OnInit {
    routes: Route[] = [];
    routeForm: FormGroup;
    showForm = false;
    isCalculatingDistance = false;
    distanceError = '';
    editingRouteId: number | null = null;

    private routeService = inject(RouteService);
    private mapRoutingService = inject(MapRoutingService);
    private fb = inject(FormBuilder);

    constructor() {
        this.routeForm = this.fb.group({
            source: ['', Validators.required],
            destination: ['', Validators.required],
            distance: [1, [Validators.required, Validators.min(1)]],
            cost: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit() {
        this.loadRoutes();
    }

    loadRoutes() {
        this.routeService.getAllRoutes().subscribe({
            next: (data: Route[]) => this.routes = data,
            error: (err: any) => console.error('Error loading routes', err)
        });
    }

    openNewForm() {
        this.editingRouteId = null;
        this.routeForm.reset({ distance: 1, cost: 0 });
        this.showForm = true;
    }

    editRoute(route: Route) {
        if (!route.id) return;
        this.editingRouteId = route.id;
        this.routeForm.patchValue({
            source: route.source,
            destination: route.destination,
            distance: route.distance,
            cost: route.cost
        });
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
        this.editingRouteId = null;
    }

    onSubmit() {
        if (this.routeForm.invalid) return;

        const formVal = this.routeForm.value;
        const routeData: Route = {
            source: formVal.source,
            destination: formVal.destination,
            distance: parseFloat(formVal.distance),
            cost: parseFloat(formVal.cost)
        };

        if (this.editingRouteId) {
            this.routeService.updateRoute(this.editingRouteId, routeData).subscribe({
                next: () => {
                    this.loadRoutes();
                    this.closeForm();
                },
                error: (err: any) => {
                    console.error('Error updating route', err);
                    alert('Update failed: ' + (err.error || err.message || 'Unknown error'));
                }
            });
        } else {
            this.routeService.createRoute(routeData).subscribe({
                next: () => {
                    this.loadRoutes();
                    this.closeForm();
                },
                error: (err: any) => {
                    console.error('Error creating route', err);
                    alert('Create failed: ' + (err.error || err.message || 'Unknown error'));
                }
            });
        }
    }

    calculateDistance() {
        const source = this.routeForm.get('source')?.value;
        const destination = this.routeForm.get('destination')?.value;

        if (!source || !destination) {
            this.distanceError = 'Please enter both Source and Destination locations.';
            return;
        }

        this.isCalculatingDistance = true;
        this.distanceError = '';

        this.mapRoutingService.calculateDistanceBetweenAddresses(source, destination).subscribe({
            next: (distance) => {
                this.isCalculatingDistance = false;
                if (distance) {
                    this.routeForm.patchValue({ distance });
                } else {
                    this.distanceError = 'Could not calculate distance. Please adjust locations or enter manually.';
                }
            },
            error: (err) => {
                this.isCalculatingDistance = false;
                this.distanceError = 'Error calculating distance. Please enter manually.';
                console.error('Distance calculation error', err);
            }
        });
    }

    deleteRoute(id: number) {
        if (confirm('Are you sure you want to delete this route? This may fail if there are active bookings associated with it.')) {
            this.routeService.deleteRoute(id).subscribe({
                next: () => this.loadRoutes(),
                error: (err: any) => {
                    console.error('Error deleting route', err);
                    alert('Delete failed: You might need ADMIN role or there are existing bookings associated with this route.');
                }
            });
        }
    }
}
