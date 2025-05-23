import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  stripePromise = loadStripe('pk_test_51RRWZeQfs77aMeK5diOhKL5RasIkVCsWwYzCnA9cvCi06WTBO8ncCh6adeTAdlqst7XVrvCBm3CQ01tSTFrYBWLu00EkFB1owQ'); // Replace with your Stripe public key

  constructor(private http: HttpClient) {}

createCheckoutSession(amount: number): Promise<any> {
  return this.http.post('https://staysearchbackend.onrender.com/api/payment/create-checkout-session', {
    amount,
    currency: 'inr'
  }).toPromise();
}

  async redirectToCheckout(sessionId: string) {
    const stripe = await this.stripePromise;
    return stripe?.redirectToCheckout({ sessionId });
  }
  createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
  return this.http.post<{ clientSecret: string }>('https://staysearchbackend.onrender.com/api/payment/create-payment-intent', { amount });
}
}