import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule,TranslateModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  isLoggedIn = false;
  
  constructor(private authService:AuthService, private router:Router){
    this.isLoggedIn = this.authService.isLoggedIn(); 
  }

  logout() {
    Swal.fire({
      title: 'Logout',
      text: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true, // ✅ Adds "No" button
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#761461",
      cancelButtonColor: "red"
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.isLoggedIn = false; // Update state
        this.router.navigate(['/']).then(() => {
          window.location.reload(); // ✅ Refresh UI
        });
      }
    });
}
}
