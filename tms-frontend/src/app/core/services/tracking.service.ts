import { Injectable } from '@angular/core';
import { Client, Message, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LocationUpdate {
    requestId: number;
    latitude: number;
    longitude: number;
}

@Injectable({
    providedIn: 'root'
})
export class TrackingService {
    private stompClient: Client | null = null;
    private locationSubject = new BehaviorSubject<LocationUpdate | null>(null);
    public location$ = this.locationSubject.asObservable();

    constructor() { }

    connect() {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);

        this.stompClient.onConnect = (frame) => {
            console.log('Connected to WebSocket: ' + frame);
        };

        this.stompClient.activate();
    }

    subscribeToTrip(requestId: number) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn('Stomp client not connected. Call connect() first.');
            return;
        }

        this.stompClient.subscribe(`/topic/trip/${requestId}/location`, (message: Message) => {
            if (message.body) {
                const location = JSON.parse(message.body) as LocationUpdate;
                this.locationSubject.next(location);
            }
        });
    }

    sendLocation(requestId: number, latitude: number, longitude: number) {
        if (!this.stompClient || !this.stompClient.connected) {
            return;
        }

        const payload: LocationUpdate = { requestId, latitude, longitude };
        this.stompClient.publish({
            destination: '/app/driver/location',
            body: JSON.stringify(payload)
        });
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }
}
