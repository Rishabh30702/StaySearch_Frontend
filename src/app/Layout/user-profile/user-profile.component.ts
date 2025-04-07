import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, TranslateModule, RouterModule, SpinnerComponent,FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  isLoggedIn = false;
  userEmail: string = '';
   isLoading: boolean = true;

   fullName: string = '';
   phoneNumber: string = '';
  
   oldPassword: string = '';
   newPassword: string = '';

   wishlist: any[] = [];

  constructor(private authService:AuthService, private router:Router){ }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  
    if (this.isLoggedIn) {
      this.authService.getUserProfile().subscribe({
        next: (data) => {
          this.userEmail = data.email;
          this.fullName = data.fullName;
          this.phoneNumber = data.phoneNumber;
  
          // ✅ Load wishlist
          this.authService.getWishlist().subscribe({
            next: (wishlistData) => {
              this.wishlist = wishlistData;
              this.isLoading = false;
            },
            error: () => {
              Swal.fire({text: 'Failed to load wishlist', icon: 'error'});
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Failed to load user profile:', err);
          this.isLoading = false;
          Swal.fire({text: 'Failed to load user profile', icon: 'error'});
          this.router.navigate(['/']).then(() => {
            this.authService.logout();
            window.location.reload();
          });
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

updateProfile() {
  this.isLoading = true
  const payload = {
    fullname: this.fullName,
    phonenumber: this.phoneNumber
  };

  this.authService.updateUserProfile(payload).subscribe({
    next: (response) => {
      console.log('Profile updated successfully:', response);
      Swal.fire({
        title: 'Success',
        text: 'Profile updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      this.isLoading = false
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update profile',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      this.isLoading = false
    }
  });
}

updatePassword() {
  this.isLoading = true;

  if (this.oldPassword && this.newPassword) {
    this.authService.updatePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        Swal.fire({ text: res.message, icon: 'success' });
        this.oldPassword = '';
        this.newPassword = '';
        this.isLoading = false;
      },
      error: (err) => {
        let errorMessage = 'Failed to update password.';

        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        Swal.fire({ text: errorMessage, icon: 'error' });
        this.isLoading = false;
      }
    });
  } else {
    Swal.fire({ text: 'Please fill in both password fields.', icon: 'warning' });
    this.isLoading = false;
  }
}

goToOverview(hotelId: string) {
  this.router.navigate(['/listings/overview'], { queryParams: { hotelId } });
}

removeFromWishlist(hotelId: any, event: MouseEvent) {
  event.stopPropagation(); // prevent navigation
  Swal.fire({
    title: 'Remove from Wishlist?',
    text: 'Do you want to remove this hotel from your wishlist?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#761461',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, remove it!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.removeFromWishlist(hotelId).subscribe({
        next: () => {
          // 👇 Important: create a new array reference
          this.wishlist = this.wishlist.filter(item => item.hotelId !== hotelId);
          Swal.fire('Removed!', 'Hotel removed from your wishlist.', 'success');
        },
        error: (err) => {
          console.error('Failed to remove from wishlist:', err);
          Swal.fire('Error', 'Failed to remove hotel. Try again.', 'error');
        }
      });
    }
  });
}


}
