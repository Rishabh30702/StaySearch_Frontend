import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-access',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-access.component.html',
  styleUrl: './admin-access.component.css',
 


})
export class AdminAccessComponent {
  constructor(private router: Router) {}
  selectedRole: string = 'owner';
  // Control which form is visible
  showLogin: boolean = true;
  showSignup: boolean = false;
  showRecoverPassword: boolean = false;
  showNotification: boolean = false;

  resetEmail: string = '';
  errorMessage: string = '';
  
  toggleForm(form: string) {
    this.showLogin = form === 'login';
    this.showSignup = form === 'signup';
    this.showRecoverPassword = form === 'recover';
    
  }

  login(){
   
   if(this.selectedRole === 'admin'){
    this.router.navigate(['adminAccess/adminPanel']);
   }
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
