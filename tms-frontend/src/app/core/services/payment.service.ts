import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = '/api/payment';

    constructor(private http: HttpClient) { }

    createOrder(amount: number, currency: string, email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-order`, { amount, currency, email });
    }

    verifyPayment(paymentData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify`, paymentData);
    }

    openCheckout(options: any, callback: Function) {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
            console.error('Payment Failed:', response.error);
            alert('Payment Failed: ' + response.error.description);
        });
        rzp.open();
    }
}
