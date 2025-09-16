import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class RazorpaySuccessComponent implements OnInit, OnDestroy {
  showLoader = false;
  formData: any;
  userData: any;
  orderId: string | null = null;
  pollingInterval: any;

  constructor(
    private router: Router,
    private hotelierService: AuthPortalService,
    private formDataService: FormDataService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // ✅ Retrieve stored form data and user data
    this.formData = this.formDataService.getFormData();
    this.userData = this.formDataService.getUserData();

    // ✅ We no longer need paymentId — we only need orderId to verify
    this.orderId = localStorage.getItem('lastOrderId');

    if (this.orderId) {
      this.startPaymentPolling(this.orderId);
    } else {
      Swal.fire('⚠️ Missing Details', 'No order found to verify payment.', 'warning');
    }
  }

  startPaymentPolling(orderId: string) {
    this.showLoader = true;
    let attempts = 0;
    const maxAttempts = 15; // ~45 seconds at 3s interval

    this.pollingInterval = setInterval(() => {
      attempts++;
      console.log(`🔄 Polling attempt #${attempts}`);

      this.http.post('https://staysearchbackend.onrender.com/api/payments/verify-payment-link', {
        orderId
      }).subscribe({
        next: (res: any) => {
          console.log('🔎 Poll Response:', res);
          const status = (res.status || '').toLowerCase();

          if (res.verified === true || status === 'paid' || status === 'captured') {
            clearInterval(this.pollingInterval);
            this.showLoader = false;
            Swal.fire('✅ Payment Verified', 'Your payment was successful.', 'success');

            // Proceed with hotelier/ hotel registration
            if (this.userData?.username) {
              this.registerHotellier();
            } else {
              this.registerHotelafterLogin(this.formData);
            }
          } else {
            console.log(`⏳ Payment not yet captured. Status: ${status}`);
            if (attempts >= maxAttempts) {
              clearInterval(this.pollingInterval);
              this.showLoader = false;
              Swal.fire('⚠️ Payment Pending', 'Could not verify payment in time. Please try later.', 'warning');
            }
          }
        },
        error: (err) => {
          console.error('❌ Verify API Error:', err);
          if (attempts >= maxAttempts) {
            clearInterval(this.pollingInterval);
            this.showLoader = false;
            Swal.fire('❌ Verification Failed', 'Unable to verify payment. Please try again.', 'error');
          }
        }
      });
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
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

  goToDashboard() {}
  goToHome() {}
}