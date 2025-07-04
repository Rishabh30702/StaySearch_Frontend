import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthPortalService } from '../admin-access/AuthPortal.service';
import Swal from 'sweetalert2';
import { FormDataService } from '../hotelliers/services/form-data.service';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {
  showLoader = false;
  formData: any;
  userData: any;
 
     constructor(private router: Router,
       private hotelierService: AuthPortalService,
       private formDataService: FormDataService,
       private route: ActivatedRoute,
       private authService: AuthService
     ) {}
    
   ngOnInit(): void {

     this.route.queryParamMap.subscribe(params => {
      this.userData = params.get('userData');
   })

if (this.userData) {
      try {
        this.userData = JSON.parse(this.userData);
      } catch (err) {
        console.error('Invalid JSON in query params');
      }
    }


   this.formData = this.formDataService.getFormData();
    if (this.formData  && this.userData) {
  this.registerHotellier();
 
}

else if(this.formData){
this.registerHotelafterLogin(this.formData);

}
else{
   console.warn('No form data found');
}
    
   }
  now = new Date();

registerHotelafterLogin(formData: FormData) {
      this.showLoader = true;
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        Swal.fire({
  icon: 'success',
  title: 'Registration Successful',
  text: 'You have been registered successfully.',
  confirmButtonColor: '#28a745'
});
 this.showLoader = false;
 this.formDataService.clear(); 
this.router.navigate(['/hotellier'])
      },
      error: (err: any) => {
        this.formDataService.clear(); 
        this.showLoader = false;
      Swal.fire({
  icon: 'error',
  title: 'Registration Failed',
  text: 'Hotel registration failed.',
  confirmButtonColor: '#d33'
});

        console.error(err);
      }
    });
  }


  registerHotellier(){
    this.showLoader = true;
          this.hotelierService.registerHotelier(this.userData).subscribe({
            next: () => {
              const loginPayload = {
                username: this.userData.username,
                password: this.userData.password
              };
      
              this.authService.loginHot(loginPayload).subscribe({
                next: (res: any) => {
                  
                  if (res.token) {
                    localStorage.setItem('token', res.token);
                    this.registerHotel(this.formData);
                  } else {
                    this.showLoader = false;
                    Swal.fire({
                      icon: 'error',
                      title: 'Login Failed',
                      text: 'Login failed. Please try again.'
                    });
                    this.showLoader = false;
                  }
                },
                error: (err: any) => {
                  this.showLoader = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: err?.error?.message || 'Invalid credentials.'
                  });
                  console.error('Login error:', err);
                }
              });
            },
            error: (err: any) => {
              this.showLoader = false;
                 Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: 'User registration failed.',
      confirmButtonColor: '#d33'
    });
    
              console.error(err);
            }
          });
        
  }


   registerHotel(formData: FormData) {
      this.hotelierService.registerHotel(formData).subscribe({
        next: () => {
            Swal.fire({
    icon: 'success',
    title: 'Registration Successful',
    text: 'Awaiting admin approval.',
    confirmButtonColor: '#28a745'
  });
  this.showLoader = false;
  
          
          localStorage.removeItem("token");
          this.router.navigate(['adminAccess'],
              {
    queryParams: { key: 'owner' } }
          );
         
        },
        error: (err: any) => {
          this.showLoader = false;
        Swal.fire({
    icon: 'error',
    title: 'Registration Failed',
    text: 'Hotel registration failed.',
    confirmButtonColor: '#d33'
  });
  
          console.error(err);
        }
      });
    }

}
