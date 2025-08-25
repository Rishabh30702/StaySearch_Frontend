import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Core/Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../../../Core/spinner/spinner.component";
import { AdminService } from './Admin.Service';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../../Layout/hotelliers/feedback.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HotelsService } from '../../../Layout/hotelliers/services/hotels.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  animations: [
    trigger('removeCard', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      state('removed', style({ opacity: 0, transform: 'scale(0.8)' })),
      transition('in => removed', animate('300ms ease-out')),
    ]),
  ],
})
export class AdminHomeComponent implements OnInit {

  isCollapsed = false;
  activeView: string = 'dashboard';

  users: any[] = [];
  selectedGateway: string = '';


  // security and access controls
statusFilter: string = 'pending'; 

  auditLogs = [
    { timestamp: '2025-04-18 10:23', user: 'Alice', action: 'Login', details: 'Successful login' },
    { timestamp: '2025-04-18 11:05', user: 'Bob', action: 'Changed Role', details: 'Changed role of Alice to Admin' }
  ];
  

  status: string = 'pending';
   amount = 0.00;

  hotels = [
    {
      Sno: 1,
      id: 'Data', h_name: 'Data', address: 'Data', col4: 'Data',
      col5: 'Data', email: "fbu@gma" , col8: 'user', col9: 'Data', status: 'pending'
   
    },
    // Structure of hotels data table
  ];

 invoices: any[] = [];
 filteredInvoices: any[] = [];
  searchInv: string = '';

  rejectModal: boolean =false;
  secBanner = false;
  secInfo = false;


pendingOffers: any[] = [];

 offers = [
    { id: 1, title: 'Summer Sale', description: 'Get 30% off on all items.', status:"", image:"",badge:"",validFrom:"",validTill:"" },
    { id: 2, title: 'Flash Deal', description: 'Limited time offer.', status:"", image:"",badge:"",validFrom:"",validTill:"" },
    { id: 3, title: 'New User Promo', description: 'Exclusive for new signups.',status:"", image:"", badge:"",validFrom:"",validTill:""},
    
    // Add more offers here
  ];

  removedOfferId: number | null = null;

  totalUsers: number = 0;
totalFeedbacks: number = 0;
pendingHoteliersCount: number = 0;
  

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



    bannersData: any[] = [];
      infoData: any[] = [];

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


  contentUpdateid = 0;
   contentUpdateid2 = 0;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private feedbackService: FeedbackService,
    private HotelsService:HotelsService,
    private router: Router,
    private http:HttpClient,
     private hotelsService: HotelsService
   
  ) {
    this.updateUnreadCount();
   }


    @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    // Redirect or stay on adminpanel
    this.router.navigateByUrl('adminAccess/adminPanel', { replaceUrl: true });
  }

  ngOnInit(): void {
      history.pushState(null, '', window.location.href);
    this.fetchUsers();
    this.fetchComments();
    this.getAllOffers();
    // console.log("Content ID",this.contentUpdateid);
 this.loadInvoices();
    this.getSelectedGateway(true);
    
    sessionStorage.setItem('lastVisitedRoute', 'adminAccess/adminPanel');
    
  
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

        // console.log('All users (sorted):', this.users);

        // Filter users after sorting
        this.filterHotelierGroups();
        this.updateDataFromUsers(); //added to the table
        this.showPendingToast();
        this.totalUsers = this.users.length;
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

    this.pendingHoteliersCount = this.pendingHoteliers.length;
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
    else if (view === 'hotels') {
      this.getHotels();
    }
    else if (view === 'configuration') {
      this.isLoading = true;
      this.fetchAmount();
    this.getSelectedGateway(false);
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


  selectedRow: any = null;

openEditModal(row: any) {
  this.selectedRow = row;
  this.showModal = true;
}

  onUpdate() {
    // console.log('Updated data:', this.updateData);
    // perform update logic here
      this.updateProfile();
    this.showModal = false;
    this.updateData.fullName = '';
    this.updateData.phoneNumber = '';
    this.updateData.newPassword = '';

  }


updateProfile() {
  this.isLoading = true
  if( this.updateData.newPassword && this.updateData.phoneNumber){
  const payload = {
    username: this.selectedRow.col1,
    newPassword: this.updateData.newPassword,
    phone: this.updateData.phoneNumber
  }; 
       
  this.adminService.updateUserProfile(payload).subscribe({
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
  });}

  else{
   Swal.fire({
  icon: 'warning',
  title: 'Missing Fields',
  text: 'Please enter password and phone number',
});

    this.isLoading=false;
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
    col3: 'N/A',
    col4: user.fullname || 'N/A' ,
    col5: user.phonenumber || 'N/A',
    id: user.id,
    col7: user.role,
    col8: 'Data',
    col9: 'Data',
    
  }));
} 


searchTerm = '';
searchkey = '';

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
  
  this.newUser.username = ""
 
  this.newUser.password = ""
}

newUser = {
  username: '',
  password: '',
  role: 'USER'
};

addnewUser() {
  console.log('User added:', this.newUser);
  // Optionally reset form and close modal manually if needed
if(this.newUser.password && this.newUser.username){
this.createNewUser();
}
else{
  Swal.fire({
  icon: 'error',
  title: 'Invalid Input',
  text: 'Please fill email and password fields correctly',
});

}


}




//hotel approval section

reviewData = {
  propertyName: 'The Royal Grand Palace',
  address: '123 Palace Road, Heritage Town, Jaipur, Rajasthan',
  accType: '',
  id:'',
 
};



closerejectModal()
{
  this.rejectModal = false;
}


deleteHotel(id: any){
  // console.log("hotel deleted: ",id);
 
  
  if(id){
   
Swal.fire({
  title: 'Are you sure?',
  text: `Do you really want to delete hotel with ID: ${id}?`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'Cancel'
}).then((result) => {
  if (result.isConfirmed) {
    this.isLoading = true;
    this.hotelsService.deleteHotel(id).subscribe({
      next: response => {
        Swal.fire({
          icon: 'success',
          title: 'Hotel Deleted',
          text: `Hotel deleted successfully: ${id}`,
          confirmButtonColor: '#3085d6'
        });
        this.isLoading = false;
        this.getHotels();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Error while deleting hotel',
          confirmButtonColor: '#d33'
        });
        this.isLoading = false;
      }
    });
  }
});



 }

}

//review 
review(){
  console.log("review success");

if(this.reviewData.propertyName && this.reviewData.address && this.reviewData.accType){
      this.isLoading = true;
  const updateHotelData =
  {
    name: this.reviewData.propertyName, // updated name for now
    address:  this.reviewData.address,
    accommodationType: this.reviewData.accType,
   
  }


  console.log("Data ready to send",updateHotelData);
   
    this.hotelsService.updateHotel(this.reviewData.id, updateHotelData).subscribe({
      next: response => {
        // console.log('Hotel updated:', response);
       this.closeModal();
          Swal.fire({
             icon: 'success',
              title: 'Update Successful',
                text: 'Hotel details updated successfully',
              confirmButtonColor: '#3085d6'
                 });

         this.getHotels();
      },
      error: err => {
        console.error('Error updating hotel:', err);
       Swal.fire({
              icon: 'error',
            title: 'Update Failed',
                 text: 'Error while updating hotel',
                 confirmButtonColor: '#d33'
                });

        this.isLoading = false;
       this.closeModal();
      }
    });
  

}

else{
  Swal.fire({
  icon: 'warning',
  title: 'Missing Information',
  text: 'Please provide all values',
  confirmButtonColor: '#f0ad4e'
});

  this.closeModal();
}








}

//security and access controls
updateUserRole(event: Event,user: any) {
  const selectedValue = (event.target as HTMLSelectElement).value;
  if(selectedValue){
    this.isLoading =true;
 const payload = {
  username: user,
  role: selectedValue
 }

 console.log(" Role : ", selectedValue);
 console.log(" username: ",user);
 
  this.adminService.updateUserProfile(payload).subscribe({
    next: (response) => {
      console.log('Profile updated successfully:', response);
      Swal.fire({
        title: 'Success',
        text: 'Profile updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      this.fetchUsers();
    
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

//  alert("");
  // Call API here to persist the change
  // this.adminService.updateRole(user.id, user.role).subscribe(...)
}



commentSearchTerm = '';

comments = [
  { id: 1, username: 'user1', text: 'Nice hotel!', status: '' },
  
  // Add more dummy comments as needed
];


fetchComments(): void {
  this.feedbackService.getAllFeedbacks().subscribe({
    next: (data) => {
      this.comments = data.map((item: any) => ({
        id: item.id,
        username: item.user.fullname || item.user.username,
        text: item.description || 'No comments provided.',
        status: item.status
      }));
      this.totalFeedbacks = this.comments.length;
    },
    error: (err) => {
      console.error('Error fetching comments:', err);
    }
  });
}

// Filter comments based on search term
filteredComments() {

    return this.comments.filter(comment => {
    const matchesStatus =
      !this.statusFilter || this.statusFilter === 'all'
        ? true
        : comment.status.toLowerCase() === this.statusFilter.toLowerCase();

    const matchesSearch =
      !this.commentSearchTerm
        ? true
        : comment.text.toLowerCase().includes(this.commentSearchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  
}

// Approve comment
onApprove(id: number) {
  this.isLoading= true;
  const comment = this.comments.find(c => c.id === id);
  if (comment) {
           const payload = {
                 id: comment.id,
                 username: comment.username,
                 text: comment.text,
                    };

    this.feedbackService.approveFeedback(payload, id).subscribe({
  next: (value) =>{
    console.log('Response:', value);
     // Should be plain text
     this.fetchComments();
    this.isLoading= false;
    Swal.fire("Feedback Approval", "Feedback approved successfully!", "success");

  },
  error: (err) => {
     this.isLoading= false;
    console.log(err);
    Swal.fire("Feedback Approval", "Error while approving feedback", "error");
  }
});

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
  type: 'banner',
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
  if(this.content.type == "banner"){
     if(!this.content.image){
      Swal.fire({
            icon: 'info',
             title: 'No Image Selected',
             text: 'Please select an image first',
             confirmButtonColor: '#3085d6'
           });

      return ;
     }
     if(this.content.title.length <1)
     {
     Swal.fire({
               icon: 'warning',
               title: 'Missing Title',
               text: 'Please enter a title',
               confirmButtonColor: '#f0ad4e'
                     });

      return;
     }
      this.isLoading = true;
     //to check current data and then perform updations accordingly
      this.adminService.getContent().subscribe({
      next: (banners) => {
         this.bannersData = banners;
         console.log("Length of data is: ",this.bannersData.length)
         this.contentAddBanner();
        }
      ,
      error: (err) => console.error('Failed to load banners:', err)
        });

   } 



   else if(this.content.type == 'info'){
          if(!this.content.image){
             Swal.fire({
            icon: 'info',
             title: 'No Image Selected',
             text: 'Please select an image first',
             confirmButtonColor: '#3085d6'
           });
               return ;
            }
             if(this.content.title.length <1)
                {
                 Swal.fire({
               icon: 'warning',
               title: 'Missing Title',
               text: 'Please enter a title',
               confirmButtonColor: '#f0ad4e'
                     });
                 return;
                   }
                   
                 if(this.content.body.length <1)
                {
                Swal.fire({
               icon: 'warning',
               title: 'Missing Content',
               text: 'Please enter Content',
               confirmButtonColor: '#f0ad4e'
                     });
                 return;
                   }
                   this.isLoading=true;
            this.adminService.getInfopage().subscribe({
              next: (info) => {
         this.infoData = info;
         console.log("Length of data is: ",this.infoData.length)
         this.infoContentAdd();
         
        }
      ,
      error: (err) => console.error('Failed to load info content:', err)
            });


   }

   else{
    Swal.fire({
             icon: 'info',
             title: 'Content Type Required',
             text: 'Please select the type of content to update',
            confirmButtonColor: '#3085d6'
         });

   }


}

infoContentAdd(){
  if(!this.infoData || this.infoData.length < 2){
     const Data = new FormData();
       Data.append('title', this.content.title);
       Data.append('image', this.content.image?? "No Image Avail");
       Data.append('content', this.content.body );

       this.adminService.postInfopage(Data).subscribe({
        next: (response) => {
        console.log('submitted successfully', response);
        this.isLoading = false;
        Swal.fire("Content Changes", "Content added Successfully",'success');
       },
       error: (error) => {
        this.isLoading = false;
         Swal.fire("Content Changes", "Content add failed",'error');
        console.error('Error submitting ', error);
         },

       })

  }
  else{
    console.log("Data already exists");

     if(this.contentUpdateid2 == 0)
      {this.contentUpdateid2 = this.infoData?.[0]?.id;}
      else{
        this.contentUpdateid2 = this.infoData?.[1]?.id;
        this.secInfo= true;
      }
       const Data = new FormData();
       Data.append('title', this.content.title);
       Data.append('image', this.content.image?? "No Image Avail");
       Data.append('content', this.content.body);

       this.adminService.updateInfopage(Data,this.contentUpdateid2).subscribe({
            next: (response) => {
        console.log(' submitted successfull', response);
        this.isLoading = false;
        if(this.secInfo){
         Swal.fire("Content Changes", "Content Updated Successfully for Info 2 ",'success');
        }
         else {
          
          Swal.fire("Content Changes", "Content Updated Successfully for Info 1",'success');
         }
       
       },
       error: (error) => {
        this.isLoading = false;
         Swal.fire("Content Changes", "Content Update failed for Info Page",'error');
        console.error('Error submitting ', error);
         },

       });
  }
}



contentAddBanner(){

     if(!this.bannersData || this.bannersData.length < 2){
       
       const Data = new FormData();
       Data.append('title', this.content.title);
       Data.append('image', this.content.image?? "No Image Avail");
       this.adminService.postContent(Data).subscribe({
       next: (response) => {
        console.log('submitted successfully', response);
        this.isLoading = false;
        Swal.fire("Content Changes", "Content Updated Successfully",'success');
       },
       error: (error) => {
        this.isLoading = false;
         Swal.fire("Content Changes", "Content Update failed",'error');
        console.error('Error submitting ', error);
         },
        });
     }
     else{
      console.log("Data Already exists");
      if(this.contentUpdateid == 0)
      {this.contentUpdateid = this.bannersData?.[0]?.id;}
      else{
        this.contentUpdateid = this.bannersData?.[1]?.id;
        this.secBanner= true;
      }
       const Data = new FormData();
       Data.append('title', this.content.title);
       Data.append('image', this.content.image?? "No Image Avail");
       this.adminService.updateContent(Data,this.contentUpdateid).subscribe({
       next: (response) => {
        console.log(' submitted successfully', response);
        this.isLoading = false;
        if(this.secBanner){
         Swal.fire("Content Changes", "Content Updated Successfully for Banner 2",'success');
        }
         else {
          
          Swal.fire("Content Changes", "Content Updated Successfully for Banner 1",'success');
         }
       
       },
       error: (error) => {
        this.isLoading = false;
         Swal.fire("Content Changes", "Content Update failed",'error');
        console.error('Error submitting ', error);
         },
        });




     }
}

scheduleContent() {
  // send `this.scheduledContent` to backend
  console.log('Scheduling content:', this.scheduledContent);
}

getHotels(){
  this.isLoading =true;
  this.adminService.getAllHotelsData().subscribe({

    next: (data) => {
      if (!data || data.length === 0) {
        console.log('No hotels data found');
        this.isLoading = false;
      } else {
        // console.log("data found");
        // console.log(data);
        this.hotels = data.map((hotel: any,index: number) => ({
          Sno: index+ 1,
          address: hotel.address || 'Unknown Location',
          id: hotel.hotelId || 0,
          h_name:hotel.name,
          col4: hotel.accommodationType
          
        }))
       
        this.isLoading = false;
      }
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Error fetching hotels:', err.message);
    }

  })
}


getAllOffers(){
  this.HotelsService.getAllOffers().subscribe({
      next: (res) => {
       this.offers = res.map((offer: any) => ({ ...offer }));
      // console.log("Offers data", this.offers)
      this.filterPendingOffers();
       
      },
      error: (err) => {
        console.error('Error fetching offers:', err);
      },
    });
  }

filterPendingOffers() {
  this.pendingOffers = this.offers.filter(o => o.status === 'PENDING');
  
}
  approveOffer(id: number, offer: any) {
    this.removedOfferId = id;
    const data ={title: offer.title,
      status:"APPROVED",
      description: offer.description,
      validFrom: offer.validFrom,
      validTill:offer.validTill,
      badge: offer.badge,
      image: offer.image

    }
     this.HotelsService.approveOfferById(id,data).subscribe({
      next: () => {
        // wait for animation end before removing
        Swal.fire("Offer Approval", "Offer Approved",'success')
      },
      error: err => {
         Swal.fire("Offer Approval", "Offer not Approved",'error')
        console.error('Failed to approve offer:', err);
        this.removedOfferId = null;
      }
    });
  

  }

  onAnimationDone(event: any, id: number) {
    if (this.removedOfferId === id) {
      this.offers = this.offers.filter(offer => offer.id !== id);
      this.removedOfferId = null;
    }
  }

  trackByOfferId(index: number, offer: any) {
    return offer.id;
  }




 createNewUser() {
    this.isLoading = true;
    this.authService.register(this.newUser).subscribe(
      response => {
        Swal.fire({title:'Success.',text:'New User creation success.', icon:'success'});
        this.isLoading = false;
        this.fetchUsers();
         this.addUser = false;
          this.newUser.username = ""
           this.newUser.password = ""

      },
      error => {
        Swal.fire({title:'Failed.',text:'Creation failed.', icon:'error'})
        this.isLoading = false;
        this.addUser = false;
  this.newUser.username = ""
  this.newUser.password = ""

      }
    );
  }



   logout() {
    
      Swal.fire({
        title: 'You are about to sign out!',
        text: 'Do you want to clear your session?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, I know',
        cancelButtonText: 'Stay',
      
      }).then(result => {
        if (result.isConfirmed) {
          localStorage.removeItem('token');
          this.router.navigate(['/adminAccess'],
             {
  queryParams: { key: 'admin' } }
          );
        }
      });
  
     
    }

   updateStripe() {
    this.isLoading = true;
  this.http.put(
    'https://staysearchbackend.onrender.com/api/payment-gateway/admin/update',
    { activeGateway: "STRIPE" }
  ).subscribe({
    next: (res) => {
      console.log('Stripe gateway activated', res);
      // alert('Stripe selected successfully!');
      // Optionally trigger Stripe payment or UI update
      this.setAmount();
      this.getSelectedGateway(false); // Refresh selected gateway
    },
    error: (err) => {
      console.error('Failed to select Stripe', err);
      Swal.fire({
             icon: 'error',
             title: 'Stripe Selection Failed',
           text: 'Failed to select Stripe. Please try again.',
            confirmButtonColor: '#d33'
                  });

      this.isLoading = false;
    }
  });
}

updateHdfc() {
  this.isLoading = true;
  this.http.put(
    'https://staysearchbackend.onrender.com/api/payment-gateway/admin/update',
    { activeGateway: "HDFC" }
  ).subscribe({
    next: (res) => {
      console.log('HDFC gateway activated', res);
      // alert('HDFC selected successfully!');
      // Optionally trigger HDFC payment or UI update
      this.setAmount();
      this.getSelectedGateway(false); // Refresh selected gateway
    },
    error: (err) => {
      console.error('Failed to select HDFC', err);
      Swal.fire({
           icon: 'error',
         title: 'HDFC Selection Failed',
           text: 'Failed to select HDFC. Please try again.',
         confirmButtonColor: '#d33'
          });

      this.isLoading = false;
    }
  });
}
//included initial as param so that incase of fresh login the loader shouldn't stop
// without getting all the data.
getSelectedGateway(initial: Boolean) {
  this.isLoading = true;
  this.http.get<{ ACTIVEGATEWAY: string }>(
    'https://staysearchbackend.onrender.com/api/payment-gateway/active'
  ).subscribe({
    next: (res) => {
      this.selectedGateway = res.ACTIVEGATEWAY;;
      if(!initial){
          this.isLoading = false;
      }  
    },
    error: (err) => {
      console.error('Failed to fetch active gateway', err);
      this.isLoading = false;
    }
  });
}


editHotels(row: any)
{
  this.reviewData.propertyName = row.h_name;
  this.reviewData.address = row.address;
  this.reviewData.accType = row.col4;
  this.reviewData.id = row.id;
this.showModal = true;
}


 get filteredHotels() {
    return this.hotels.filter(hotel =>
      hotel.h_name.toLowerCase().includes(this.searchkey.toLowerCase())
    );
  }


fetchAmount() {
  this.adminService.getAmountpage().subscribe({
    next: (res: any) => {
      // assuming API returns { amount: 5000 }
      this.amount = res;
      console.log("Amount set to:", this.amount);
    },
    error: (err) => {
      console.error("Error fetching amount:", err);
    }
  });
}


setAmount() {

  if(this.amount==0){
    Swal.fire('Error!', 'Please Enter Amount!', 'error');
    return;
  }
  const payload =  parseFloat(Number(this.amount).toFixed(2))  ;   // build request body

  this.adminService.updateAmount(payload).subscribe({
    next: (res) => {
      console.log("Amount updated successfully:", res);
    },
    error: (err) => {
      console.error("Error updating amount:", err);
    }
  });
}

 loadInvoices() {
    this.adminService.getAllInvoices().subscribe({
      next: (res) => {
        this.invoices = this.filteredInvoices=res; // Assuming backend returns an array of invoices
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
      }
    });
  }


 filterInvoices() {
    const text = this.searchInv.toLowerCase();
    this.filteredInvoices = this.invoices.filter(invoice =>
      invoice.paymentId?.toLowerCase().includes(text) ||
      invoice.orderId?.toLowerCase().includes(text) ||
      invoice.customerEmail?.toLowerCase().includes(text) ||
      invoice.customerPhone?.toLowerCase().includes(text) ||
      invoice.hotelName?.toLowerCase().includes(text)
    );
  }


downloadInv(orderId: string) {
  this.isLoading = true;
  console.log("Downloading invoice for:", orderId);

   this.adminService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (err) => {
         this.isLoading = false;
        console.error('Invoice download failed', err);
      }
    });

 
}

}
