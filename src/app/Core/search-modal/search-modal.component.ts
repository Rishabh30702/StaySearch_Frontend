import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../spinner/spinner.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [FormsModule, NgIf, SpinnerComponent],
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.css'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-50px)' }))
      ])
    ]),
    trigger('moveTitleUp', [
      transition(':enter', [
        style({ transform: 'translateY(50px)', opacity: 0 }),
        animate('1200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInForm', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('700ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SearchModalComponent implements OnInit {
  @Input()  showModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  showForm: boolean = false;
  place: string = '';
  hotelName: string = '';

  user = { username: '', password: '', role: 'USER' }; // Default role is 'USER'
  message: string = '';
  isLoading: boolean = false;
  constructor(private router: Router, private cdr: ChangeDetectorRef,
    private authService: AuthService) {}

  ngOnInit(): void {
    console.log('SearchModalComponent initialized');

    // ✅ Delay modal check to avoid slowing down page rendering
    setTimeout(() => {
      if (!sessionStorage.getItem('modalShown')) {
        this.showModal = true;
        // sessionStorage.setItem('modalShown', 'true');
        setTimeout(() => {
          this.showForm = true;
          this.cdr.detectChanges(); // ✅ Prevents Angular from unnecessary UI checks
        }, 1000);
      }
    }, 500); // ✅ Reduced initial delay for smoother loading
  }

  search(event: Event): void {
    event.preventDefault();
    console.log('Search submitted with:', this.place, this.hotelName);
    this.closeModal();
    this.router.navigate(['/listings'], {
      queryParams: { place: this.place, hotelName: this.hotelName }
    });
  }

  
  isSignup: boolean = false;

  toggleSignup() {
    this.isSignup = !this.isSignup;
  }


  closeModal(): void {
    console.log('Modal closed');
    this.showModal = false;
    this.close.emit(); 
  }

  register() {
    this.isLoading = true;
    this.authService.register(this.user).subscribe(
      response => {
        this.message = response.message;
        localStorage.setItem('token', response.token);
        Swal.fire({title:'Success.',text:'Welcome to StaySearch. Register success.', icon:'success'})
        this.router.navigate(['/listings']); // Redirect after registration
      },
      error => {
        this.message = 'Registration failed';
        Swal.fire({title:'Failed.',text:'Registration failed.', icon:'error'})
        this.isLoading = false;
      }
    );
  }

  login() {
    this.isLoading = true;
    this.authService.login({ username: this.user.username, password: this.user.password }).subscribe(
      (response: any) => {
        localStorage.setItem('token', response.token);
        Swal.fire({title:'Success.',text:'Welcome to StaySearch. Login success.', icon:'success'})
        this.router.navigate(['/listings']);
        this.isLoading = false;
      },
      error => {
        this.message = 'Invalid credentials';
        Swal.fire({title:'Failed.',text:'Login failed.', icon:'error'})
        this.isLoading = false;
      }
    );
  }
  

}
