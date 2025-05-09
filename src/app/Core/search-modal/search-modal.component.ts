import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../Services/AuthService/services/auth.service';
import { SpinnerComponent } from "../spinner/spinner.component";
import Swal from 'sweetalert2';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [FormsModule, NgIf, SpinnerComponent,FontAwesomeModule],
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

  const isLoggedIn = this.authService.isLoggedIn(); // ✅ Check if user is logged in

  if (!isLoggedIn) {
    setTimeout(() => {
      if (!sessionStorage.getItem('modalShown')) {
        this.showModal = true;
        sessionStorage.setItem('modalShown', 'true'); // ✅ Store flag so it doesn't show again
        setTimeout(() => {
          this.showForm = true;
          this.cdr.detectChanges(); // ✅ Prevents unnecessary UI checks
        }, 1000);
      }
    }, 500); // ✅ Reduced initial delay for smoother loading
  }
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
  showPassword = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showRetype = false;



  toggleSignup(form:any, form2: any, password: any) {
    form.resetForm(); 
    form2.resetForm(); 
    password.value = ''; 
    this.user.username = "";
    this.user.password = "";
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

  login(): void {
    this.isLoading = true;

    this.authService
      .login({ username: this.user.username, password: this.user.password })
      .subscribe(
        (resp: any) => {
          localStorage.setItem('token', resp.token);
          Swal.fire({ title: 'Success', text: 'Welcome to StaySearch.', icon: 'success' });

          /* ---------- decide where to land ---------- */
          const cameFromOverview = this.router.url.startsWith('/listings/overview');

          if (cameFromOverview) {
            // just close the search modal; stay on Overview
            this.close.emit();             // whatever method hides the modal
            // You may emit an event here so OverviewComponent knows login succeeded
          } else {
            // user opened the modal from Home / elsewhere → go to Listings
            this.router.navigate(['/listings']);
          }
          /* ----------------------------------------- */

          this.isLoading = false;
        },
        _err => {
          Swal.fire({ title: 'Failed', text: 'Invalid credentials.', icon: 'error' });
          this.isLoading = false;
        }
      );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleRetypeVisibility() {
    this.showRetype = !this.showRetype;
  }

}

