import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormDataService } from '../../form-data.service';
import { AuthPortalService } from '../../../../admin-access/AuthPortal.service';
import { AuthService } from '../../../../../Core/Services/AuthService/services/auth.service';
import { CommonModule } from '@angular/common';

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

  now = new Date();

  constructor(
    private router: Router,
    private hotelierService: AuthPortalService,
    private formDataService: FormDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get stored data from FormDataService
    this.formData = this.formDataService.getFormData();
    this.userData = this.formDataService.getUserData();

    if (!this.formData) {
      Swal.fire('⚠️ Something went wrong', 'Unable to process registration.');
      return;
    }

    if (this.userData?.username) {
      // New user → register user + hotel
      this.registerHotellier();
    } else {
      // Logged-in user → register hotel
      this.registerHotelafterLogin(this.formData);
    }
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
      error: (err) => {
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
