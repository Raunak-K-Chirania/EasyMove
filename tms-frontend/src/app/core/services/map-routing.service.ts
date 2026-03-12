import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, of, catchError } from 'rxjs';

export interface Coordinates {
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapRoutingService {
  private http = inject(HttpClient);

  // Use Photon API (Komoot/OSM) to get coordinates from an address string.
  // Photon does not block CORS for browsers, unlike Nominatim.
  getCoordinates(address: string): Observable<Coordinates | null> {
    const url = '/api/photon';

    const params = new HttpParams()
      .set('q', address)
      .set('limit', '1');

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response && response.features && response.features.length > 0) {
          const coords = response.features[0].geometry.coordinates;
          return {
            lat: coords[1], // Photon returns [lon, lat]
            lon: coords[0]
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching coordinates from Photon API', error);
        return of(null);
      })
    );
  }

  // Use OSRM API to get driving distance between two coordinates in kilometers
  getDrivingDistance(start: Coordinates, end: Coordinates): Observable<number | null> {
    // OSRM format: longitude,latitude
    const url = `/api/osrm/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.routes && response.routes.length > 0) {
          // OSRM distance is in meters, convert to kilometers and round to 2 decimal places
          return Math.round((response.routes[0].distance / 1000) * 100) / 100;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching distance from OSRM', error);
        return of(null);
      })
    );
  }

  // Convenience method to do everything: geocode both addresses and return distance
  calculateDistanceBetweenAddresses(source: string, destination: string): Observable<number | null> {
    return this.getCoordinates(source).pipe(
      switchMap(sourceCoords => {
        if (!sourceCoords) return of(null);

        return this.getCoordinates(destination).pipe(
          switchMap(destCoords => {
            if (!destCoords) return of(null);

            return this.getDrivingDistance(sourceCoords, destCoords);
          })
        );
      })
    );
  }
}
