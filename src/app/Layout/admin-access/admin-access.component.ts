import { CommonModule } from "@angular/common";
import { Component, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthPortalService } from "./AuthPortal.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-admin-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-access.component.html',
  styleUrl: './admin-access.component.css'
})
export class AdminAccessComponent {
  constructor(private router: Router, private hotelierService: AuthPortalService) {}

  selectedRole: string = 'owner';

  // Form visibility
  showLogin: boolean = true;
  showSignup: boolean = false;
  showRecoverPassword: boolean = false;
  showNotification: boolean = false;

  // Fields
  resetEmail: string = '';
  errorMessage: string = '';

  // Login Form Fields
  loginUsername: string = '';
  loginPassword: string = '';

  // Signup Form Fields
  signupUsername: string = '';
  signupEmail: string = '';
  signupPassword: string = '';
  signupRepeatPassword: string = '';
  signupContact: string = '';
  signupGstin: string = '';

  toggleForm(form: string) {
    this.showLogin = form === 'login';
    this.showSignup = form === 'signup';
    this.showRecoverPassword = form === 'recover';
  }
  login() {
      // Clear old token before any new login
  localStorage.removeItem('token');
    if (this.selectedRole === 'admin') {
      // Admin logic (for now just routing)
      this.router.navigate(['adminAccess/adminPanel']);
      return;
    }
  
    const payload = {
      username: this.loginUsername,
      password: this.loginPassword
    };
  
    this.hotelierService.loginHotelier(payload).subscribe({
      next: (res: any) => {
        if (res.token) {
          // Approved hotelier, store token and route
          localStorage.setItem('token', res.token);
          this.router.navigate(['hotellier']);
        } else if (res.message && res.message.includes('pending')) {
          // Pending approval case
          Swal.fire({
            icon: 'info',
            title: 'Pending Approval',
            text: res.message
          });
        } else {
          // Other unexpected responses
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Something went wrong. Please try again.'
          });
        }
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err?.error?.message || 'Invalid credentials. Please try again.'
        });
        console.error('Login error:', err);
      }
    });
  }
  

  registerHotelier() {
    if (this.signupPassword !== this.signupRepeatPassword) {
      alert("Passwords do not match.");
      return;
    }

    const data = {
      fullname: this.signupEmail,
      username: this.signupUsername,
      password: this.signupPassword,
      phoneNumber: this.signupContact,
      gstin: this.signupGstin
    };

    this.hotelierService.registerHotelier(data).subscribe({
      next: (res:any) => {
        alert("Registration successful. Awaiting admin approval.");
        this.toggleForm('login');
      },
      error: (err:any) => {
        alert("Registration failed. Try again later.");
        console.error(err);
      }
    });
  }

  resetPassword() {
    if (!this.resetEmail) {
      this.errorMessage = 'Email not valid.';
    } else {
      this.showNotification = true;
      this.showRecoverPassword = false;
    }
  }
}
