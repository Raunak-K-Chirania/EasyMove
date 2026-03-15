import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../../../core/services/tracking.service';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container shadow-sm border rounded">
      <div #mapElement class="map-view"></div>
      <div class="map-overlay" *ngIf="!lastUpdate">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading map...</span>
        </div>
        <p class="mt-2">Waiting for driver location...</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 400px;
      background: #f8fafc;
    }
    .map-view {
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    .map-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
  `]
})
export class TrackingMapComponent implements OnInit, OnDestroy {
  @Input() requestId!: number;
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  private map!: L.Map;
  private marker!: L.Marker;
  private subscription!: Subscription;
  lastUpdate: any = null;

  constructor(private trackingService: TrackingService) {}

  ngOnInit(): void {
    this.initMap();
    this.trackingService.subscribeToTrip(this.requestId);
    
    this.subscription = this.trackingService.location$.subscribe(loc => {
      if (loc && loc.requestId === this.requestId) {
        this.updateMarker(loc.latitude, loc.longitude);
        this.lastUpdate = new Date();
      }
    });
  }

  private initMap(): void {
    // Default to a general view
    this.map = L.map(this.mapElement.nativeElement).setView([19.0760, 72.8777], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'assets/images/truck-marker.png', // We'll need this asset or similar
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    this.marker = L.marker([19.0760, 72.8777], { icon }).addTo(this.map);
  }

  private updateMarker(lat: number, lng: number): void {
    const newPos = L.latLng(lat, lng);
    this.marker.setLatLng(newPos);
    this.map.panTo(newPos);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
