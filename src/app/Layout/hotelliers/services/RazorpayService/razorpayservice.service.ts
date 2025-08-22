import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RazorpayserviceService {
  private API = 'https://staysearchbackend.onrender.com/api/payments';

  constructor(private http: HttpClient) { }

  createOrder(amountInPaise: number, receipt?: string): Observable<any> {
    return this.http.post(`${this.API}/create-order`, {
      amountInPaise,
      currency: 'INR',
      receipt: receipt || 'rcpt_' + Date.now(),
      autoCapture: true
    });
  }

  verifyPayment(data: any): Observable<any> {
    return this.http.post(`${this.API}/verify`, data);
  }
}
