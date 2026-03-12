import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MessagingService {
    private messaging = inject(Messaging);
    currentMessage = new BehaviorSubject<any>(null);

    constructor() { }

    requestPermission() {
        getToken(this.messaging, { vapidKey: 'BJsP2weGE8i8-WooLPUO9omnVqCdOTYV7ad_DrqNyp3CIZNwGlo5ykJAaXnFGIRxmcMtmhKw4U75i4wmG1WL840' }).then(
            (token: string | null) => {
                if (token) {
                    console.log('FCM Token:', token);
                    // Here you would typically send the token to your backend
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }
        ).catch((err: any) => {
            console.log('An error occurred while retrieving token. ', err);
        });
    }

    listenForMessages() {
        onMessage(this.messaging, (payload: any) => {
            console.log('Message received. ', payload);
            this.currentMessage.next(payload);
        });
    }
}
