import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [FormsModule, NgIf],
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
  showModal: boolean = false;
  showForm: boolean = false;
  place: string = '';
  hotelName: string = '';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

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
  }
}
