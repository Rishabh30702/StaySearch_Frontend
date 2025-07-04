import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SearchModalComponent } from "../../Core/search-modal/search-modal.component";
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SearchData } from '../../Core/search-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FeedbackServiceService } from '../../Core/Services/feedback-service.service';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';
import { SpinnerComponent } from '../../Core/spinner/spinner.component';
import { HotelListingService } from '../../Core/Services/hotel-listing.service';
import { HotelsService } from '../hotelliers/services/hotels.service';
import { AdminService } from '../../admin-panel/Layout/admin-home/Admin.Service';


@Component({
  selector: 'app-home',
  imports: [SearchModalComponent,FormsModule,TranslateModule,RouterModule,CommonModule,SpinnerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  @ViewChild('feedbackContainer', { static: false }) feedbackContainer!: ElementRef;
  @ViewChild('offersContainer', { static: false }) offersContainer!: ElementRef;
  currentLanguage = 'en';
  langText = 'English';
  feedbackList: any[] = [];
  isLoggedIn = false;
  showModal: boolean = false;
  isLoading: boolean = false;
  loading: boolean = false;



  // ✅ NEW: Offers Data
  offers = [
    {
      title: "New offers",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/163106136.jpg?k=fe39a687f9b2ee3be94510826493007415a556b7ca5a72d95b9a8be002be3de2&o=&hp=1"
      
    },
    {
      title: "Best Price Guarantee",
      description: "Find better hotel prices anywhere else & get a double refund on the price difference.",
      validity: "Valid till: 31st Mar, 2025",
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/163106136.jpg?k=fe39a687f9b2ee3be94510826493007415a556b7ca5a72d95b9a8be002be3de2&o=&hp=1"
      
    },
    {
      title: "Get up to 25% OFF*",
      description: "Enjoy memorable experiences with up to 25% OFF* on Cygnett Hotels & Resorts.",
      validity: "Valid till: 31st Mar, 2025",
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/598919770.jpg?k=ebb1ef54cd30e5370018f889949beee78b77ce6e18b4a6b2c0158d0b6671c167&o=&hp=1"
      
    },
    {
      title: "Get up to 45% OFF*",
      description: "Make your stay affordable with 45% OFF* on The Hosteller Hotels.",
      validity: "Valid till: 31st Mar, 2025",
      image: "https://apimedia.tfehotels.com/media-green/optimized/b5/2a/b52ab0ec-ec20-4128-83e3-6d44c913c3f0/haeder-image-added-to-sunset-suite-room-type-1440w.jpg"
      
    },
    {
      title: "Summer Sale",
      description: "Special summer discounts up to 30% off on all hotels.",
      validity: "Valid till: 15th June, 2025",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Early Bird Offers",
      description: "Book early & save up to 20% on your next trip!",
      validity: "Valid till: 30th Sep, 2025",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Winter Festive Sale",
      description: "Up to 40% off during the winter holiday season!",
      validity: "Valid till: 5th Jan, 2026",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Weekend Getaways",
      description: "Flat 20% off for weekend bookings at selected hotels!",
      validity: "Valid till: 30th Dec, 2025",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image: "https://static.vecteezy.com/system/resources/previews/012/607/991/non_2x/special-offer-banner-label-icon-with-megaphone-flat-design-illustration-on-white-background-vector.jpg"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/163106136.jpg?k=fe39a687f9b2ee3be94510826493007415a556b7ca5a72d95b9a8be002be3de2&o=&hp=1"
      
    },
    {
      title: "Hotel JP Palace",
      description: "Flat 15% off",
      validity: "Valid till: 31st Mar, 2025",
      badge: "APP EXCLUSIVE",
      image:"https://cf.bstatic.com/xdata/images/hotel/max1024x768/163106136.jpg?k=fe39a687f9b2ee3be94510826493007415a556b7ca5a72d95b9a8be002be3de2&o=&hp=1"
      
    },
  ];
  

  topRatedHotels = [
    {
      name: 'Ramada Palace Agra',
      image: 'ramada.jpg',
      id:1
    },
    {
      name: 'Amar Villas Lucknow',
      image: 'amarvilas.jpg',
      id:1
    },
    {
      name: 'The Ramayana, Ayodhya',
      image: 'rama.jpg',
      id:1
    },
    {
      name: 'Lemon Tree, Agra',
      image: 'lemontree.jpg',
      id:1
    },
    {
      name: 'JP Palace, Agra',
      image: 'jp.jpg',
      id:1
    },
    {
      name: 'JP Palace, Agra',
      image: 'jp.jpg',
      id:1
    }
  ];
  


  // happenig in UP
  events = [
    {
      title: '',
      description: '',
      image: '',
      altText: 'Kumbh Mela',
      className: 'kumbh-mela',
      imageFirst: true
    },
    {
      title: '',
      description: '',
      image: '',
      altText: 'Braj Ki Holi',
      className: 'braj-holi',
      imageFirst: false
    }
  ];


    slides = [
    {
      image: '',
      alt: '',
      caption: '',
      icon: ''
    },
    {
      image: '',
      alt: '',
      caption: '',
      icon: ''
    },
    // Add more slides here
  ];


  searchData: SearchData = {
    destination: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    rooms: 1
  };
  constructor (private router:Router,private translate: TranslateService,
    private feedbackService: FeedbackServiceService, private authService:AuthService,
  private hoteListingService: HotelListingService,private HotelsService:HotelsService,
  private adminService: AdminService
  ){
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

    const hasLoggedOut = sessionStorage.getItem('hasLoggedOut');

    // If the user has not logged out yet, check if there's a token
    if (!hasLoggedOut) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('User is logged in. Logging out...');
        this.authService.logout();  // Log out the user
        sessionStorage.setItem('hasLoggedOut', 'true');  // Mark that user has been logged out
      }
    }

    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.translate.use(this.currentLanguage);
    this.updateLangText();
    this.getHotels();
    this.generateStars();
    this.showFeedbacks();
    this.getAllOffers();
    this.getBannerContent();
    this.getInfoContent();
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
  
        // console.log('Sorted Feedback Data:', this.feedbackList);
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
    if (this.offersContainer) {
      this.offersContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.feedbackContainer) {
      this.feedbackContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
    if (this.offersContainer) {
      this.offersContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
 



  navigateTo(name:string){
    console.log(name);
    this.searchData.destination = name;
    this.router.navigate(['/listings'], { queryParams: this.searchData });
  }



  onHotelClick(hotel: any): void {
    
    // ✅ Reset filters by clearing query parameters
    this.router.navigate(['listings/overview'], { 
      queryParams: { hotelId: hotel },
      queryParamsHandling: 'merge'  // Keeps only `hotelId` and removes others
    });
  
  
    
  }

 getHotels(){
  this.loading = true;
  
  this.hoteListingService.getHotels().subscribe(
    (data: any) => {
      if (!data || data.length === 0) {
        console.log('No hotels data found');
        this.loading = false;
       
      } else {
        // console.log('Data found');
        // console.log(data);
  
         this.topRatedHotels = data.map((hotel: any) => ({
          image: hotel.imageUrl,
          id: hotel.hotelId || 0,
          name: hotel.name
        })); 
  
        this.loading = false;
      }
    },
    (err) => {
      this.loading = false;
      console.error('Error fetching hotels:', err.message);
    }
  );
  

  
 }


getAllOffers(){
  this.HotelsService.getOffers().subscribe({
      next: (res) => {

        //filtering on the basis of most recent first -> higher discount
        
   this.offers = res
  .map((offer: any) => ({ ...offer }))
  .sort((a: { validFrom: string, description: string }, b: { validFrom: string, description: string }) => {
    const dateA = new Date(a.validFrom).getTime();
    const dateB = new Date(b.validFrom).getTime();

    if (dateA !== dateB) {
      return dateB - dateA; // Newest first
    }

    const descA = parseFloat(a.description);
    const descB = parseFloat(b.description);

    return descB - descA; // Higher description value first
  });
      // console.log("Offers data", this.offers)
       
      },
      error: (err) => {
        console.error('Error fetching offers:', err);
      },
    });
  }


  getBannerContent(){
    this.isLoading = true;
    this.adminService.getContent().subscribe(
      {

         next: (banners) => {
            //  for now only 2nd and 3rd item is shown
               this.slides = banners.slice(0, 2).map((item: any, index: number) => ({
               caption: item.title,
               image: item.imageUrl,
               alt: index == 0? 'First Slide' : 'Second Slide',
               icon: 'MDI.png' 
                  }));
                  this.isLoading = false;
        //  console.log("banner content ",banners)
        
        }
      ,
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load banners:', err)}

      }
    )
  }




  getInfoContent(){
    this.adminService.getInfopage().subscribe(
      {

         next: (res) => {
            //  for now only 2nd and 3rd item is shown
               this.events = res.slice(0, 2).map((item: any, index: number) => ({
               title: item.title,
               image: item.imageUrl,
               description: item.content,
               altText: item.title,
               classname: index == 0? 'kumbh-mela' : 'braj-holi',
               imageFirst: index == 0? true : false
                  }));
        //  console.log("info content ",res)
        
        }
      ,
      error: (err) => console.error('Failed to load Info page:', err)

      }
    )
  }

}

