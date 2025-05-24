import { CommonModule } from "@angular/common";
import { Component, NgModule, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthPortalService } from "./AuthPortal.service";
import Swal from "sweetalert2";
import { SpinnerComponent } from "../../Core/spinner/spinner.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { AuthService } from "../../Core/Services/AuthService/services/auth.service";

@Component({
  selector: 'app-admin-access',
  standalone: true,
  imports: [CommonModule, FormsModule,SpinnerComponent,FontAwesomeModule],
  templateUrl: './admin-access.component.html',
  styleUrl: './admin-access.component.css'
})
export class AdminAccessComponent implements OnInit {
  constructor(private router: Router, private hotelierService: AuthPortalService
  ) {}
  ngOnInit(): void {
    
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };

  }

  selectedRole: string = 'owner';

  isLoading: boolean = false;

userEmail = "";
phoneNumber = "";
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

    // clearing register form
    this.signupUsername ='';
    this.signupEmail='';
    this.signupPassword='';
    this.signupRepeatPassword='';
    this.signupContact='';
   
  }
  login() {
      // Clear old token before any new login
  localStorage.removeItem('token');
    this.isLoading =true;
    const payload = {
      username: this.loginUsername,
      password: this.loginPassword
    };

     if (this.selectedRole === 'admin') {
    // Call admin login API
    this.hotelierService.loginAdmin(payload).subscribe({
      next: (res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.isLoading = false;
          this.router.navigate(['adminAccess/adminPanel']);
        } else {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid admin credentials.',
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err?.error?.message || 'Invalid admin credentials.',
        });
      },
    });
  } else if (this.selectedRole === 'owner') {
     this.hotelierService.loginHotelier(payload).subscribe({
      
      next: (res: any) => {
       
        if (res.token) {
         
          // Approved hotelier, store token and route
          localStorage.setItem('token', res.token);
          this.isLoading =false;
          this.router.navigate(['hotellier']);
        } else if (res.message && res.message.includes('pending')) {
          // Pending approval case
          this.isLoading =false;
          Swal.fire({
            icon: 'info',
            title: 'Pending Approval',
            text: res.message
          });
        } else {
          this.isLoading =false;
          // Other unexpected responses
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Something went wrong. Please try again.'
          });
        }
      },
      error: (err: any) => {
        this.isLoading =false;
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err?.error?.message || 'Invalid credentials. Please try again.'
        });
        console.error('Login error:', err);
      }
        
    });

  }
  }
  


  isFormValid(): boolean {
    return (
      !!this.signupUsername?.trim() &&
      !!this.signupEmail?.trim() &&
      !!this.signupPassword?.trim() &&
      !!this.signupRepeatPassword?.trim() &&
      !!this.signupContact?.trim() 
    );
  }


  

  // registerHotelier() {
 
  //   if (this.signupPassword !== this.signupRepeatPassword) {
  //     alert("Passwords do not match.");
  //     return;
  //   }
    
    
    
  //   const data = {
  //     fullname: this.signupEmail,
  //     username: this.signupUsername,
  //     password: this.signupPassword,
  //     phonenumber: this.signupContact,
  //     // gstin: this.signupGstin
  //   };

  //   this.hotelierService.registerHotelier(data).subscribe({
  //     next: (res:any) => {
  //       alert("Registration successful. Awaiting admin approval.");
  //       this.toggleForm('login'); 
       

  //     },
  //     error: (err:any) => {
  //       alert("Registration failed. Try again later.");
  //       console.error(err);
  //     }
  //   });
  

  // }

  registerHotelier() {
    if (this.signupPassword !== this.signupRepeatPassword) {
        alert("Passwords do not match.");
        return;
    }
    
    const data = {
        fullname: this.signupEmail,
        username: this.signupUsername,
        password: this.signupPassword,
        phonenumber: this.signupContact,
        // gstin: this.signupGstin
    };

   
            this.router.navigate(['hotellier'], {
                queryParams: {
                  fullname: this.signupEmail,
                  username: this.signupUsername,
                  password: this.signupPassword,
                  phonenumber: this.signupContact,
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



 
  showPassword: boolean = false;
   faEye = faEye;
    faEyeSlash = faEyeSlash;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


   
}
