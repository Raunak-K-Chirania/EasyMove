import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models/vehicle.model';

@Component({
    selector: 'app-admin-vehicles',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './vehicles.component.html'
})
export class VehiclesComponent implements OnInit {
    vehicles: Vehicle[] = [];
    vehicleForm: FormGroup;
    isEditing = false;
    editingId: number | null = null;
    showForm = false;

    private vehicleService = inject(VehicleService);
    private fb = inject(FormBuilder);

    constructor() {
        this.vehicleForm = this.fb.group({
            registrationNumber: ['', Validators.required],
            type: ['', Validators.required],
            capacity: [0, [Validators.required, Validators.min(1)]],
            status: ['AVAILABLE', Validators.required]
        });
    }

    ngOnInit() {
        this.loadVehicles();
    }

    loadVehicles() {
        this.vehicleService.getAllVehicles().subscribe({
            next: (data: Vehicle[]) => this.vehicles = data,
            error: (err: any) => console.error('Error loading vehicles', err)
        });
    }

    openNewForm() {
        this.isEditing = false;
        this.editingId = null;
        this.vehicleForm.reset({ status: 'AVAILABLE', capacity: 0 });
        this.showForm = true;
    }

    openEditForm(vehicle: Vehicle) {
        this.isEditing = true;
        this.editingId = vehicle.id || null;
        this.vehicleForm.patchValue(vehicle);
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
    }

    onSubmit() {
        if (this.vehicleForm.invalid) return;

        const vehicleData: Vehicle = this.vehicleForm.value;

        if (this.isEditing && this.editingId) {
            this.vehicleService.updateVehicle(this.editingId, vehicleData).subscribe({
                next: () => {
                    this.loadVehicles();
                    this.closeForm();
                },
                error: (err: any) => console.error('Error updating vehicle', err)
            });
        } else {
            this.vehicleService.createVehicle(vehicleData).subscribe({
                next: () => {
                    this.loadVehicles();
                    this.closeForm();
                },
                error: (err: any) => console.error('Error creating vehicle', err)
            });
        }
    }

    deleteVehicle(id: number) {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            this.vehicleService.deleteVehicle(id).subscribe({
                next: () => this.loadVehicles(),
                error: (err: any) => {
                    console.error('Error deleting vehicle', err);
                    alert('Delete failed: You might need ADMIN role or there are associated records.');
                }
            });
        }
    }
}
