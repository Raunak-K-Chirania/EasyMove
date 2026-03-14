import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportRequestService } from '../../../../core/services/transport-request.service';
import { RouteService } from '../../../../core/services/route.service';
import { Route } from '../../../../core/models/route.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-transport',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './request-transport.component.html',
  styleUrls: ['./request-transport.component.css']
})
export class RequestTransportComponent implements OnInit {

  currentStep = 1;
  totalSteps = 3;

  requestForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  routes: Route[] = [];
  selectedRoute: Route | null = null;
  isLoadingRoutes = true;

  distanceKm: number | null = null;
  estimatedPrice: number | null = null;

  constructor(
    private fb: FormBuilder,
    private transportRequestService: TransportRequestService,
    private routeService: RouteService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      routeId: [''],

      pickupAddress: this.fb.group({
        houseNo:  ['', Validators.required],
        floor:    [''],
        area:     ['', Validators.required],
        ward:     [''],
        pincode:  ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        landmark: ['']
      }),

      dropAddress: this.fb.group({
        houseNo:  ['', Validators.required],
        floor:    [''],
        area:     ['', Validators.required],
        ward:     [''],
        pincode:  ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        landmark: ['']
      }),

      preferredTime:       [''],
      specialInstructions: ['']
    });
  }

  ngOnInit(): void {
    this.routeService.getAllRoutes().subscribe({
      next: (routes) => {
        this.routes = routes;
        this.isLoadingRoutes = false;
      },
      error: () => {
        this.isLoadingRoutes = false;
      }
    });

    this.requestForm.get('routeId')?.valueChanges.subscribe(id => {
      const route = this.routes.find(r => r.id === +id);
      if (route) {
        this.selectedRoute = route;
        this.distanceKm = route.distance;
        this.estimatedPrice = route.cost;
      } else {
        this.selectedRoute = null;
        this.distanceKm = null;
        this.estimatedPrice = null;
      }
    });
  }

  get stepOneValid(): boolean {
    return !!this.requestForm.get('routeId')?.value;
  }

  get stepTwoValid(): boolean {
    return this.requestForm.get('pickupAddress')!.valid &&
           this.requestForm.get('dropAddress')!.valid;
  }

  nextStep() {
    if (this.currentStep === 1 && !this.stepOneValid) return;
    if (this.currentStep === 2 && !this.stepTwoValid) {
      this.requestForm.get('pickupAddress')!.markAllAsTouched();
      this.requestForm.get('dropAddress')!.markAllAsTouched();
      return;
    }
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number) {
    if (step < this.currentStep) this.currentStep = step;
  }

  private buildAddressString(group: FormGroup): string {
    const v = group.value;
    const parts: string[] = [];
    if (v.houseNo)  parts.push(v.houseNo);
    if (v.floor)    parts.push(`${v.floor} Floor`);
    if (v.area)     parts.push(v.area);
    if (v.ward)     parts.push(`Ward ${v.ward}`);
    if (v.pincode)  parts.push(v.pincode);
    if (v.landmark) parts.push(`(Near ${v.landmark})`);
    return parts.join(', ');
  }

  onSubmit() {
    if (!this.stepTwoValid) return;
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const pickupAddress = this.requestForm.get('pickupAddress') as FormGroup;
    const dropAddress   = this.requestForm.get('dropAddress')   as FormGroup;

    let preferredTime = this.requestForm.get('preferredTime')?.value || null;
    if (preferredTime && preferredTime.length === 16) {
      preferredTime += ':00';
    }

    const routeIdVal = this.requestForm.get('routeId')?.value;

    const requestData: any = {
      pickupLocation:      this.buildAddressString(pickupAddress),
      dropLocation:        this.buildAddressString(dropAddress),
      preferredTime,
      specialInstructions: this.requestForm.get('specialInstructions')?.value || null,
      distanceKm:          this.distanceKm,
      price:               this.estimatedPrice,
      routeId:             routeIdVal ? +routeIdVal : null
    };

    this.transportRequestService.createRequest(requestData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.requestForm.reset();
        this.currentStep = 1;
        setTimeout(() => {
          this.router.navigate(['/customer/my-requests']);
        }, 2500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = 'Failed to submit request. Please try again.';
        console.error(err);
      }
    });
  }
}
