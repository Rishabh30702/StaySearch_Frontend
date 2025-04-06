import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, TranslateModule, RouterModule, SpinnerComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  isLoggedIn = false;
  userEmail: string = '';
   isLoading: boolean = true;
  
  constructor(private authService:AuthService, private router:Router){ }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.authService.getUserProfile().subscribe({
        next: (data) => {
          this.userEmail = data.email // depending on your backend
          this.isLoading = false; // ✅ Stop loading spinner
        },
        error: (err) => {
          console.error('Failed to load user profile:', err);
          this.isLoading = false; // ✅ Stop loading spinner
          Swal.fire({text: 'Failed to load user profile', icon: 'error'});
        }
      });
    }
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
