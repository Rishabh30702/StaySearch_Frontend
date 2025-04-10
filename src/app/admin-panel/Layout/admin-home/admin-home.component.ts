import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Core/Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../../../Core/spinner/spinner.component";
import { AdminService } from './Admin.Service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  isCollapsed = false;
  activeView: string = 'dashboard';

  users: any[] = [];

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


  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.isLoading = false;
      }
    });
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

  // Pagination helpers (for users list)
  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
