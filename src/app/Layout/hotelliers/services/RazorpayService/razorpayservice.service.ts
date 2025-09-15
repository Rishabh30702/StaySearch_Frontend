import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RazorpayserviceService {
 private API = 'https://staysearchbackend.onrender.com/api/payments';

  // private API = 'http://localhost:8080/api/payments';

  

  constructor(private http: HttpClient) {}

  /** ✅ Create an order on the backend */
  createOrder(amountInPaise: number, receipt?: string): Observable<any> {
    return this.http.post(`${this.API}/create-order`, {
      amountInPaise,
      currency: 'INR',
      receipt: receipt || 'rcpt_' + Date.now(),
      autoCapture: true
    });
  }

  /** ✅ Verify payment by order_id + payment_id + signature */
  verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Observable<{ verified: boolean }> {
    return this.http.post<{ verified: boolean }>(`${this.API}/verify`, data);
  }

  /** ✅ Create a Razorpay Payment Link */
  createPaymentLink(payload: {
    amountInPaise: number;
    currency?: string;
    customerEmail?: string;
    customerContact?: string;
    receipt?: string;
    notes?: any;
  }): Observable<{
    paymentLinkId: string;
    status: string;
    shortUrl: string;
  }> {
    return this.http.post<{
      paymentLinkId: string;
      status: string;
      shortUrl: string;
    }>(`${this.API}/create-payment-link`, payload);
  }

  /** ✅ Verify Payment Link on backend */
  // razorpayservice.service.ts
verifyPaymentLink(payload: { orderId: string; paymentId: string }) {
  return this.http.post(this.API+'/verify-payment-link', payload);
}

}
