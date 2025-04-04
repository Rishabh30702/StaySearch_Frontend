import { Component, ElementRef, ViewChild } from '@angular/core';
import { SearchModalComponent } from "../../Core/search-modal/search-modal.component";
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SearchData } from '../../Core/search-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FeedbackServiceService } from '../../Core/Services/feedback-service.service';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home',
  imports: [SearchModalComponent,FormsModule,TranslateModule,RouterModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @ViewChild('feedbackContainer', { static: false }) feedbackContainer!: ElementRef;
  currentLanguage = 'en';
  langText = 'English';
  feedbackList: any[] = [];
  isLoggedIn = false;
  showModal: boolean = false;

  searchData: SearchData = {
    destination: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    rooms: 1
  };
  constructor (private router:Router,private translate: TranslateService,
    private feedbackService: FeedbackServiceService, private authService:AuthService){
      this.isLoggedIn = this.authService.isLoggedIn(); 
  }

  toggleModal(): void {
    if (!this.isLoggedIn) {
      this.showModal = !this.showModal; // ✅ Only show if not logged in
    }
  }
  closeModal(): void {
    this.showModal = false; // ✅ Reset when closed
  }

  toggleLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    this.updateLangText();
  }

  updateLangText() {
    this.langText = this.currentLanguage === 'en' ? 'English' : 'हिन्दी';
  }


  searchHotels() {
    // Navigate to listings with search parameters
    this.router.navigate(['/listings'], { queryParams: this.searchData });
  }

  hotelRating: number = 4.5; // Static rating value
  stars: string[] = [];

  ngOnInit() {

    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translate.use(this.currentLanguage);
    this.updateLangText();

    this.generateStars();
    this.showFeedbacks();
  }

  generateStars() {
    this.stars = [];
    let fullStars = Math.floor(this.hotelRating);
    let halfStar = this.hotelRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      this.stars.push('full');
    }
    if (halfStar) {
      this.stars.push('half');
    }
    let emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      this.stars.push('empty');
    }
  }

  showFeedbacks(){

    this.feedbackService.getFeedback().subscribe(
      (data) => {
        // Sort feedback from newest to oldest based on createdAt timestamp
        this.feedbackList = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
        console.log('Sorted Feedback Data:', this.feedbackList);
      },
      (error) => {
        console.error('Error fetching feedback:', error);
      }
    );
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('full');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }



  scrollLeft() {
    if (this.feedbackContainer) {
      this.feedbackContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.feedbackContainer) {
      this.feedbackContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
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
        this.toggleModal() // Redirect to login page
        this.router.navigate(['/']).then(() => {
          window.location.reload(); // ✅ Refresh UI
        });
      }
    });
}





}

