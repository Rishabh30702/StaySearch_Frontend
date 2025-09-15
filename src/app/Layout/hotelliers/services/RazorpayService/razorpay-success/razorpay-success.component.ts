import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormDataService } from '../../form-data.service';
import { AuthPortalService } from '../../../../admin-access/AuthPortal.service';
import { AuthService } from '../../../../../Core/Services/AuthService/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-razorpay-success',
  templateUrl: './razorpay-success.component.html',
  imports: [CommonModule],
  styleUrls: ['./razorpay-success.component.css']
})
export class RazorpaySuccessComponent implements OnInit {
  showLoader = false;
  formData: any;
  userData: any;
  paymentId: string | null = null;

  constructor(
    private router: Router,
    private hotelierService: AuthPortalService,
    private formDataService: FormDataService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get stored data from FormDataService
    this.formData = this.formDataService.getFormData();
    this.userData = this.formDataService.getUserData();

    // ✅ Extract paymentId from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    this.paymentId = urlParams.get('razorpay_payment_id');

    if (this.paymentId) {
      // Save to localStorage so refresh doesn't break flow
      localStorage.setItem('lastPaymentId', this.paymentId);
    } else {
      this.paymentId = localStorage.getItem('lastPaymentId');
    }

    if (this.paymentId) {
      this.verifyPayment(this.paymentId);
    } else {
      Swal.fire('⚠️ Missing Payment ID', 'Unable to verify payment — no paymentId found.', 'warning');
    }
  }

  verifyPayment(paymentId: string) {
    this.showLoader = true;

    this.http.get(`https://staysearchbackend.onrender.com/api/payments/check-payment-status/${paymentId}`, {
    responseType: 'json'
  }).subscribe({
      next: (res: any) => {
        this.showLoader = false;
        console.log('🔎 Payment Verification Response:', res);

        if (!res || typeof res !== 'object') {
          Swal.fire('❌ Error', 'Invalid response from server.', 'error');
          return;
        }

        const status = (res.status || '').toLowerCase();
        const isVerified = res.verified === true || status === 'paid' || status === 'captured';

        if (isVerified) {
          Swal.fire('✅ Payment Verified', 'Your payment was successful.', 'success');

          // Proceed with user/hotel registration flow
          if (this.userData?.username) {
            this.registerHotellier();
          } else {
            this.registerHotelafterLogin(this.formData);
          }
        } else {
          Swal.fire('⚠️ Payment Pending', `Current status: ${status || 'unknown'}`, 'warning');
        }
      },
      error: (err) => {
        this.showLoader = false;
        console.error('❌ Verify API Error:', err);

        let message = 'Failed to verify payment.';
        if (err?.error?.details) {
          message += `\nDetails: ${err.error.details}`;
        }

        Swal.fire('❌ Verification Failed', message, 'error');
      }
    });
  }

  registerHotelafterLogin(formData: any) {
    this.showLoader = true;
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        this.formDataService.clear();
        Swal.fire('✅ Registration Successful', 'Hotel registered successfully.', 'success');
        this.router.navigate(['/hotellier']);
      },
      error: (err) => {
        this.formDataService.clear();
        Swal.fire('❌ Registration Failed', 'Hotel registration failed.', 'error');
        console.error(err);
      }
    });
  }

  registerHotellier() {
    const payload = { ...this.userData, propertyData: this.formData };
    this.showLoader = true;

    this.hotelierService.registerHotelier(payload).subscribe({
      next: () => {
        const loginPayload = { username: this.userData.username, password: this.userData.password };
        this.authService.loginHot(loginPayload).subscribe({
          next: (res: any) => {
            if (res.token) {
              localStorage.setItem('token', res.token);
              this.registerHotel(this.formData);
            } else {
              Swal.fire('❌ Login Failed', 'Login failed after registration.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('❌ Login Failed', err?.error?.message || 'Invalid credentials.', 'error');
          }
        });
      },
      error: () => {
        Swal.fire('❌ Registration Failed', 'User registration failed.', 'error');
      }
    });
  }

  registerHotel(formData: any) {
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        Swal.fire('✅ Registration Successful', 'Awaiting admin approval.', 'success');
        localStorage.removeItem('token');
        this.router.navigate(['adminAccess'], { queryParams: { key: 'owner' } });
      },
      error: (err) => {
        Swal.fire('❌ Registration Failed', 'Hotel registration failed.', 'error');
        console.error(err);
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/hotellier']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
