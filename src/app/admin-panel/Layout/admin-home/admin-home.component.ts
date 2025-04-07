import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../Core/Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../../../Core/spinner/spinner.component";

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'] // Fixed from styleUrl to styleUrls
})
export class AdminHomeComponent implements OnInit {

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
  }

}
