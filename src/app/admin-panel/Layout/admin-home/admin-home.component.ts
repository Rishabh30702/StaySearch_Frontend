import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Core/Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../../../Core/spinner/spinner.component";
import { AdminService } from './Admin.Service';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../../Layout/hotelliers/feedback.service';


@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  isCollapsed = false;
  activeView: string = 'dashboard';

  users: any[] = [];


  // security and access controls


  auditLogs = [
    { timestamp: '2025-04-18 10:23', user: 'Alice', action: 'Login', details: 'Successful login' },
    { timestamp: '2025-04-18 11:05', user: 'Bob', action: 'Changed Role', details: 'Changed role of Alice to Admin' }
  ];
  

  status: string = 'pending';


  hotels = [
    {
      Sno: 1,
      col1: 'Data', col2: 'Data', col3: 'Data', col4: 'Data',
      col5: 'Data', id: 1 , col8: 'user', col9: 'Data', status: 'pending'
   
    },
    // Structure of hotels data table
  ];


  rejectModal: boolean =false;



  showNotificationDropdown = false;

  notifications: { title: string, message: string, time: Date, read: boolean }[] = [
    { title: 'New User Registered', message: 'A new user has registered on your platform.', time: new Date(), read: false },
    { title: 'Booking Received', message: 'You have received a new booking.', time: new Date(), read: false },
    { title: 'Payment Successful', message: 'The payment for booking #12345 has been successfully processed.', time: new Date(), read: true }
  ];
  unreadNotificationsCount: number = 0;
  // Grouped hoteliers
  approvedHoteliers: any[] = [];
  pendingHoteliers: any[] = [];
  rejectedHoteliers: any[] = [];
  otherHoteliers: any[] = [];

  // Pagination variables
  currentPage: number = 1;
  pageSize: number = 5;

  isLoading: boolean = true;

  showApproved = true;
  showPending = true;
  showRejected = true;

  selectedStatus: string = 'pending';

  showModal: boolean = false;
  oldPassword:string = '';

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private feedbackService: FeedbackService
   
  ) {
    this.updateUnreadCount();
   }

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchComments();
  }

  toggleGroup(group: string): void {
    if (group === 'approved') this.showApproved = !this.showApproved;
    if (group === 'pending') this.showPending = !this.showPending;
    if (group === 'rejected') this.showRejected = !this.showRejected;
  }

  approveHotelier(id: number): void {
    Swal.fire({
      title: 'Approve Hotelier?',
      text: 'Do you want to approve this hotelier?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.adminService.approveHotelier(id).subscribe({
          next: () => {
            Swal.fire('Approved!', 'Hotelier has been approved.', 'success');
            this.fetchUsers();
            this.isLoading = false;
          },
          error: () => {
            Swal.fire('Error!', 'Something went wrong!', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  makePending(id: number): void {
    Swal.fire({
      title: 'Change Status to Pending?',
      text: 'Do you want to move this hotelier back to pending status?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, make pending'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.adminService.makeHotelierPending(id).subscribe({
          next: () => {
            Swal.fire('Updated!', 'Hotelier status set to pending.', 'success');
            this.fetchUsers();  // Refresh cards
            this.isLoading = false;
          },
          error: () => {
            Swal.fire('Error!', 'Something went wrong!', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  
  markAsRead(notification: any): void {
    notification.read = true;
    this.updateUnreadCount();
  }

  // Method to update the count of unread notifications
  updateUnreadCount(): void {
    this.unreadNotificationsCount = this.notifications.filter(notification => !notification.read).length;
  }

  rejectHotelier(id: number): void {
    Swal.fire({
      title: 'Reject Hotelier?',
      text: 'Are you sure you want to reject this hotelier?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.adminService.rejectHotelier(id).subscribe({
          next: () => {
            Swal.fire('Rejected!', 'Hotelier has been rejected.', 'success');
            this.fetchUsers();  // Refresh cards
            this.isLoading = false;
          },
          error: () => {
            Swal.fire('Error!', 'Something went wrong!', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Fetch all users and group by status
  fetchUsers(): void {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        // Sort by createdAt (latest first)
        this.users = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        console.log('All users (sorted):', this.users);

        // Filter users after sorting
        this.filterHotelierGroups();
        this.updateDataFromUsers(); //added to the table
        this.showPendingToast();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.isLoading = false;
      }
    });
  }

  showPendingToast(): void {
    if (this.pendingHoteliers.length > 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `You have ${this.pendingHoteliers.length} pending hotelier request(s)!`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
    }
  }
  

  filterHotelierGroups(): void {
    const allHoteliers = this.users.filter(user =>
      user.role?.toLowerCase() === 'hotelier'
    );

    this.approvedHoteliers = allHoteliers.filter(user => user.status === 'APPROVED');
    this.pendingHoteliers = allHoteliers.filter(user => user.status === 'PENDING');
    this.rejectedHoteliers = allHoteliers.filter(user => user.status === 'REJECTED');
  }


  // Delete a user with confirmation
  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.authService.deleteUser(userId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'User has been deleted successfully.', 'success');
            this.fetchUsers();
            this.isLoading = false;
          },
          error: (err) => {
            Swal.fire('Error!', "Something went wrong", 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Toggle sidebar
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Switch view
  switchView(view: string): void {
    this.activeView = view;
    if (view === 'users') {
      this.fetchUsers();
    } else if (view === 'approvals') {
      this.fetchPendingHoteliers();
    }
  }

  fetchPendingHoteliers(): void {
    this.pendingHoteliers = this.users.filter(user => (user.status || '').toLowerCase() === 'pending');
  }


  updateData = {
    fullName: '',
    phoneNumber: '',
    newPassword: ''
  };

  onUpdate() {
    console.log('Updated data:', this.updateData);
    // perform update logic here
     this.updateProfile();
     this.updatePassword();
    
    this.showModal = false;
    this.updateData.fullName = '';
    this.updateData.phoneNumber = '';
    this.updateData.newPassword = '';

  }


updateProfile() {
  this.isLoading = true
  const payload = {
    fullname: this.updateData.fullName,
    phonenumber: this.updateData.phoneNumber
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
  
    if (this.updateData.newPassword) {
      
      this.authService.updatePassword(this.oldPassword, this.updateData.newPassword).subscribe({
        next: (res) => {
          Swal.fire({ text: res.message, icon: 'success' });
        
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




  closeModal(): void {
    this.showModal = false;
  
    this.updateData.fullName = '';
    this.updateData.phoneNumber = '';
    this.updateData.newPassword = '';
  }

updateDataFromUsers(): void {
  this.data = this.users.map((user, index) => ({
    
    Sno: index + 1,
    col1: user.username || 'N/A',
    col2: user.password.slice(0,10),
    col3: '43/125 Sikandra,Agra -282007 U.P India',
    col4: user.fullname || 'N/A' ,
    col5: user.phonenumber || 'N/A',
    id: user.id,
    col7: user.role,
    col8: 'Data',
    col9: 'Data',
    
  }));
} 


searchTerm = '';

data = [
  {
    Sno: 1,
    col1: 'Data', col2: 'Data', col3: 'Data', col4: 'Data',
    col5: 'Data', id: 1, col7: 'Data', col8: 'Data', col9: 'Data',
 
  },
  // Structure of user data table
];

filteredData() {
  if (!this.searchTerm) return this.data;
  const term = this.searchTerm.toLowerCase();
  return this.data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(term)
    )
  );
}



addUser = false;

closeNewUserModal()
{
  this.addUser = false;
  this.newUser.fullName = ""
  this.newUser.email = ""
  this.newUser.phone = ""
  this.newUser.role = ""
}

newUser = {
  fullName: '',
  email: '',
  phone: '',
  role: ''
};

addnewUser() {
  console.log('User added:', this.newUser);
  // Optionally reset form and close modal manually if needed


  this.addUser = false;
  this.newUser.fullName = ""
  this.newUser.email = ""
  this.newUser.phone = ""
  this.newUser.role = ""
}




//hotel approval section

reviewData = {
  propertyName: 'The Royal Grand Palace',
  address: '123 Palace Road, Heritage Town, Jaipur, Rajasthan',
  ownerName: 'Mr. Rajiv Sharma',
  phoneNumber: '9876543210',
  email: 'royalgrand@gmail.com',
  photo1: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/18/07/50/holiday-inn-agra-facade.jpg?w=1200&h=-1&s=1',
  photo2: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/18/07/50/holiday-inn-agra-facade.jpg?w=1200&h=-1&s=1'
};



closerejectModal()
{
  this.rejectModal = false;
}


approveHotel(){
  console.log("hotel aaproved");

}

//review 
review(){
  console.log("review success");

}

//security and access controls
updateUserRole(event: Event,currentUserid: number) {
  const selectedValue = (event.target as HTMLSelectElement).value;
  console.log(currentUserid);
 alert( selectedValue);
  // Call API here to persist the change
  // this.adminService.updateRole(user.id, user.role).subscribe(...)
}



commentSearchTerm = '';

comments = [
  { id: 1, username: 'user1', text: 'Nice hotel!', status: 'pending' },
  
  // Add more dummy comments as needed
];


fetchComments(): void {
  this.feedbackService.getAllFeedbacks().subscribe({
    next: (data) => {
      this.comments = data.map((item: any) => ({
        id: item.id,
        username: item.user.fullname || item.user.username,
        text: item.description || 'No comments provided.',
        status: "pending"
      }));
    },
    error: (err) => {
      console.error('Error fetching comments:', err);
    }
  });
}

// Filter comments based on search term
filteredComments() {
  return this.comments.filter(c =>
    c.text.toLowerCase().includes(this.commentSearchTerm.toLowerCase())
  );
}

// Approve comment
onApprove(id: number) {
  const comment = this.comments.find(c => c.id === id);
  if (comment) {
    comment.status = 'approved';
    console.log(`Approved comment ID: ${id}`);
    alert(`Approved comment from ${comment.username}`);
  }
}

// Delete comment
onDelete(id: number) {

  Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this feedback!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.feedbackService.deleteFeedback(id, { responseType: 'text' as 'json' }).subscribe({
            next: () => {
              this.comments = this.comments.filter(f => f.id !== id);
              Swal.fire('Deleted!', 'Feedback has been deleted.', 'success');
            },
            error: () => {
              Swal.fire('Error!', 'Could not delete feedback.', 'error');
            }
          });
        }
      });
  
}




// content updates

content = {
  type: '',
  title: '',
  body: '',
  image: null
};

scheduledContent = {
  title: '',
  scheduleTime: ''
};

onImageUpload(event: any) {
  this.content.image = event.target.files[0];
}

submitContentUpdate() {
  // send `this.content` to backend
  console.log('Submitting content update:', this.content);
}

scheduleContent() {
  // send `this.scheduledContent` to backend
  console.log('Scheduling content:', this.scheduledContent);
}


}
