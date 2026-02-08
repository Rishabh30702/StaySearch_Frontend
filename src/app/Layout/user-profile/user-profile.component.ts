import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";
import { FormsModule } from '@angular/forms'; 
import { Feedback } from '../overview/feedback.modal';
import { FeedbackService } from '../overview/feedback.service';
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

  feedbackList: Feedback[] = [];
  newFeedback: Feedback = {
    description: '',
    likedAmenities: [],
    rating: 5,
    hotelName: ''
  };
  
  editFeedback: Feedback = {
    description: '',
    likedAmenities: [],
    rating: 5,
    hotelName: ''
  };
  
  
  editing = false;
  editingId: number | null = null;

  showEditModal = false;
likedAmenitiesText = '';

expandedWishlistIndex: number | null = null;

  constructor(private authService:AuthService, private router:Router,
    private feedbackService: FeedbackService
  ){ }

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

    this.loadFeedback();

  }

  toggleWishlistPanel(index: number): void {
    if (this.expandedWishlistIndex === index) {
      this.expandedWishlistIndex = null; // collapse if already open
    } else {
      this.expandedWishlistIndex = index; // open selected
    }
  }

  toggleExpand(feedback: Feedback) {
    this.feedbackList.forEach(fb => fb.expanded = false); // collapse others
    feedback.expanded = !feedback.expanded;
  }
  
  openEditModal(feedback: Feedback) {
    this.editFeedback = { ...feedback };
    this.likedAmenitiesText = feedback.likedAmenities?.join(', ') || '';
    this.editingId = feedback.id!;
    this.showEditModal = true;
  }
  
  closeEditModal() {
    this.showEditModal = false;
    this.editingId = null;
  }

  loadFeedback() {
    this.isLoading = true
    this.feedbackService.getUserFeedback().subscribe((res) => {
      // Sort feedbacks by date safely
      this.feedbackList = res
        .filter(fb => !!fb.createdAt) // Filter out undefined/null createdAt
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        this.isLoading = false
      // Expand first feedback if available
      if (this.feedbackList.length > 0) {
        this.feedbackList[0].expanded = true;
        this.isLoading = false
      }
    });
  }
  
  
  
  // onSubmit() {
  //   this.feedbackService.submitFeedback(this.newFeedback).subscribe(() => {
  //     this.newFeedback = { comment: '', rating: 5 }; // no userId
  //     this.loadFeedback();
  //   });
  // }
  
  edit(feedback: Feedback) {
    this.editFeedback = {
      ...feedback,
      likedAmenities: [...feedback.likedAmenities], // clone the array
    };
    this.editingId = feedback.id!;
    this.editing = true;
  }
  
  update() {
    this.isLoading = true;
  
    // Clamp rating between 1 and 5
    if (this.editFeedback.rating > 5) {
      this.editFeedback.rating = 5;
    } else if (this.editFeedback.rating < 1) {
      this.editFeedback.rating = 1;
    }
  
    if (this.editingId !== null) {
      // Parse liked amenities from comma-separated string
      const likedAmenities = this.likedAmenitiesText
        .split(',')
        .map(a => a.trim())
        .filter(a => a); // remove empty strings
  
      // Prepare clean payload
      const payload = {
        hotelName: this.editFeedback.hotelName,
        likedAmenities: likedAmenities,
        rating: this.editFeedback.rating,
        description: this.editFeedback.description,
        createdAt: this.editFeedback.createdAt // include only if backend requires it
      };
  
      this.feedbackService.updateFeedback(this.editingId, payload).subscribe(() => {
        this.loadFeedback();
        this.closeEditModal();
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }
  
  
  cancelEdit() {
    this.editing = false;
    this.editingId = null;
  }
  
  delete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this feedback?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.isLoading= true
        this.feedbackService.deleteFeedback(id).subscribe({
          next: (response: string) => {
            Swal.fire('Deleted!', response, 'success');
            this.loadFeedback();
            this.isLoading= false
          },
          error: (error) => {
            Swal.fire('Failed!', error.error || 'Failed to delete the feedback.', 'error');
            this.isLoading= false
          }
        });
      }
    });
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

   // 2. Strong password regex
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  if (!strongPasswordRegex.test(this.newPassword)) {
    alert(
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
    );
    return;
  }
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

formatAmenities(amenities: any): string {
  if (Array.isArray(amenities)) {
    return amenities.join(', ');
  } else if (typeof amenities === 'string') {
    return amenities;
  } else {
    return '';
  }
}


}
