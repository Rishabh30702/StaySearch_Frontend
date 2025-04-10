
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Core/Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../../../Core/spinner/spinner.component";
import { FormsModule } from '@angular/forms';
import { HotelRegistration } from '../../hotel-reg';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, SpinnerComponent,FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'] // Fixed from styleUrl to styleUrls
})
export class AdminHomeComponent implements OnInit {
  hotelRegistrations: HotelRegistration[] = [
 
  ];
  showModal: boolean = false;
  isCollapsed = false;
  activeView: string = 'dashboard';

  users: any[] = [];

  // Pagination variables
  currentPage: number = 1;
  pageSize: number = 5;

  isLoading: boolean = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchUsers();
    
  }

  // Fetch all users from backend
  fetchUsers(): void {
    this.isLoading = true; // Start spinner
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
       this.updateDataFromUsers(); //added to the table
        this.isLoading = false; // Stop spinner on success
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.isLoading = false; // Stop spinner on error
      }
    });
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
        this.isLoading = true; // Start spinner
        this.authService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter(user => user.id !== userId);
            Swal.fire('Deleted!', 'User has been deleted successfully.', 'success');
            this.fetchUsers();
            this.isLoading = false; // Stop spinner after deletion
          },
          error: (err) => {
            Swal.fire('Error!', "Something went wrong", 'error');
            this.isLoading = false; // Stop spinner on error
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
    }
  }
/*
  // Get paginated users using a getter
  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  // Calculate total number of pages
  get totalPages(): number {
    return Math.ceil(this.users.length / this.pageSize);
  }

  // Move to next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Move to previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  } */
   

   

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
        phonenumber:  this.updateData.phoneNumber
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
        
        this.authService.adminUpdatePassword( this.updateData.newPassword).subscribe({
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




}