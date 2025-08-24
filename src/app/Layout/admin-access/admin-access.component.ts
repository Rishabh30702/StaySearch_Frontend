import { CommonModule } from "@angular/common";
import { Component, NgModule, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
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
  constructor(private router: Router, private hotelierService: AuthPortalService,private route: ActivatedRoute,
  private authService: AuthService
  ) {}
  accessKey: string | null = null;
  ngOnInit(): void {
    
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };


 this.route.queryParamMap.subscribe(params => {
      this.accessKey = params.get('key');

    });
    
      if (this.accessKey == 'admin' ) {
    this.selectedRole = 'admin';
      }
      if (this.accessKey == 'owner' ) {
    this.selectedRole = 'owner';
      }


  }

  selectedRole: string = '';

  isLoading: boolean = false;
  idExist: boolean = true;

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
         this.router.navigate(['adminAccess/adminPanel'], {
  queryParams: { value: "admin" }
});
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
          this.router.navigate(['hotellier'], {
  queryParams: { value: "hotellier" }
});
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
        Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'Passwords do not match.'
});

        return;
    }


    if (!/^\d{10}$/.test(this.signupContact)) {
  Swal.fire({
    icon: 'error',
    title: 'Invalid Contact Number',
    text: 'Please Provide a valid contact number.'
  });
  return;
}
    
    const data = {
        fullname: this.signupEmail,
        username: this.signupUsername,
        password: this.signupPassword,
        phonenumber: this.signupContact,
        // gstin: this.signupGstin
    };

   this.checkExisting(this.signupUsername);
 
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

checkExisting(username: any){
  this.isLoading=true;
   this.authService.getAllUsers().subscribe({
      next: (res) => {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/gi, '');

this.idExist = res.some((user: any) =>
  normalize(user.username) === normalize(username)
);
         this.isLoading=false;
           if(!this.idExist){
            this.router.navigate(['hotellier'], {
                queryParams: {
                  fullname: this.signupEmail,
                  username: this.signupUsername,
                  password: this.signupPassword,
                  phonenumber: this.signupContact,
                  newUser: true

                }
            });
}
else {
  this.isLoading=false;
        Swal.fire({
          icon: 'warning',
          title: 'Username Already Exists',
          text: 'The chosen username is already taken. Please choose a different one.',
        });
      }
    
      },
      error: (err) => {
        this.isLoading=false;
        console.error('Error fetching users', err);
         Swal.fire({
        icon: 'error',
        title: 'Failed ',
        text: 'An error occurred, Please try again later.',
      });
        
      }
    });
}
   
}
