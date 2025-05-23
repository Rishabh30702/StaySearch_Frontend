import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FeedbackServiceService } from '../../Core/Services/feedback-service.service';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import { SearchModalComponent } from "../../Core/search-modal/search-modal.component";

@Component({
  selector: 'app-overview',
  imports: [CommonModule, SpinnerComponent, FormsModule, SearchModalComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  hotel: any = {
    amenities: [], // Ensure it's always an array
    rooms: [], // Ensure it's always an array
  };
  hotelId: string = ''; // Store hotel ID from query params
  private map: any;
  activeTab: string = 'overview';
  expandedRooms: { [key: string]: boolean } = {};
  isLoading: boolean = true;
  isLoggedIn = false;
  showModal: boolean = false;
  @ViewChildren('desc') descriptions!: QueryList<ElementRef>;

  isFeedbackPopupVisible: boolean = false;
hotelRating: number = 0;
feedbackText: string = "";
amenities = [
  { name: "WiFi", selected: false },
  { name: "Room Service", selected: false },
  { name: "Food Quality", selected: false },
  { name: "Staff Behavior", selected: false },
  { name: "Facilites", selected: false },
  { name: "Cleanliness", selected: false },
  { name: "Location", selected: false },
  { name: "Service", selected: false },
  { name: "Comfort", selected: false },
  { name: "Value of money", selected: false },
];
stars = Array(5).fill(0);
  
  constructor(private route: ActivatedRoute, private http: HttpClient,
    private feedbackService:FeedbackServiceService, private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log("Query Params:", params); // Debugging
     

      this.hotelId = params['hotelId'];
      console.log("Extracted hotelId:", this.hotelId); // Debugging

      if (this.hotelId) {
        this.fetchHotelData();
      } else {
        console.error("hotelId is missing in queryParams!");
        this.isLoading = false
      }
    });
  }

  fetchHotelData(): void {
    if (!this.hotelId) {
      console.error("Hotel ID is missing!");
      return;
    }
  
    const apiUrl = `https://staysearchbackend.onrender.com/v1/hotel/${this.hotelId}`;
    console.log("Fetching from API:", apiUrl);
  
    this.http.get(apiUrl).subscribe(
      (data: any) => {
        console.log("Fetched Hotel Data:", data);
  
        if (data) {
          this.hotel = {
            ...data,
            latitude: data.lat,
            longitude: data.lng,
            roomsList: data.roomsList?.map((room: any) => ({
              ...room,
              showExpandIcon: room.description && room.description.length > 50, // Ensure check for description existence
            })) || [],
          };
  
          this.hotel.roomsList.forEach((room: any) => {
            this.expandedRooms[room.id] = false;
          });
  
          this.isLoading = false;
          setTimeout(() => this.loadMap(), 500);
          this.scrollToTop();
        } else {
          console.error("Invalid API response", data);
          this.isLoading = false;
        }
      },
      (error) => {
        console.error("Error fetching hotel data:", error);
        this.isLoading = false;
      }
    );
  }
  
  toggleRoomExpansion(roomId: number) {
    this.expandedRooms[roomId] = !this.expandedRooms[roomId];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadMap();
    }, 500);
  }

  toggleMap() {
    if (!this.hotel.latitude || !this.hotel.longitude) {
      console.error("Latitude and Longitude not available");
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${this.hotel.latitude},${this.hotel.longitude}`;
    window.open(googleMapsUrl, '_blank');
  }

  private loadMap(): void {
    if (!this.hotel.latitude || !this.hotel.longitude) {
      console.error("Latitude and Longitude not provided");
      return;
    }

    if (this.map) {
      this.map.remove(); // Ensure we don't create multiple maps
    }

    this.map = L.map('map').setView([this.hotel.latitude, this.hotel.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([this.hotel.latitude, this.hotel.longitude]).addTo(this.map)
      .bindPopup(this.hotel.name || 'Hotel Location')
      .openPopup();
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeTab = sectionId;
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const sections = ['overview', 'amenities', 'rooms', 'location'];
    const scrollPosition = window.scrollY + 200;

    for (const sectionId of sections) {
      const section = document.getElementById(sectionId);
      if (section && scrollPosition >= section.offsetTop) {
        this.activeTab = sectionId;
      }
    }
  }

  // Function to toggle feedback popup
toggleFeedbackPopup() {
  this.isFeedbackPopupVisible = !this.isFeedbackPopupVisible;
  if (this.isFeedbackPopupVisible) {
    document.documentElement.style.overflow = "hidden"; // Disable scrolling
  } else {
    document.documentElement.style.overflow = ""; // Enable scrolling
  }
}

// Function to rate hotel
rateHotel(rating: number) {
  this.hotelRating = rating;
}

// Function to submit feedback
submitFeedback(): void {
  /* ---------- 1. Guard: must be logged in ---------- */
  if (!this.authService.isLoggedIn()) {
    this.isFeedbackPopupVisible = !this.isFeedbackPopupVisible;
    Swal.fire({
      title: 'Please log in',
      text: 'You need to sign in to submit feedback.',
      icon: 'warning',
      confirmButtonText: 'OK',
      cancelButtonAriaLabel: 'Cancel',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false
    }).then(result => {
      if (result.isConfirmed) {
        document.documentElement.style.overflow = ""; // Enable scrolling
        this.toggleModal();   // open your login modal
      }
    });
    document.documentElement.style.overflow = "";
    return; 
                      // ⛔ stop here until they really log in
  }

  /* ---------- 2. Already logged in ---------- */
  this._submit();
}

/* ---------- core submission logic ---------- */
private _submit(): void {
  this.isLoading = true;

  // Check if user has provided a rating
  if (!this.hotelRating) {
    Swal.fire({ title: 'Warning', text: 'Please give a rating before submitting!', icon: 'warning' });
    this.isLoading = false;
    return;
  }

  // Check if hotel data is available
  if (!this.hotel?.name) {
    Swal.fire({ title: 'Error', text: 'Hotel data is missing. Please try again!', icon: 'error' });
    this.isLoading = false;
    return;
  }

  // Prepare the feedback data
  const selectedAmenities = this.amenities.filter(a => a.selected).map(a => a.name);
  const feedbackData = {
    hotelName: this.hotel.name,
    likedAmenities: selectedAmenities,
    rating: this.hotelRating,
    description: this.feedbackText
  };

  // Submit the feedback
  this.feedbackService.submitFeedback(feedbackData).subscribe({
    next: () => {
      Swal.fire({ title: 'Success', text: 'Thank you for your feedback!', icon: 'success' });

      // Reset the feedback form after success
      this._resetForm();

    },
    error: () => {
      Swal.fire({ title: 'Error', text: 'Failed to submit feedback. Please try again!', icon: 'error' });
      this.isLoading = false;
    }
  });
}

/* ---------- Reset the form after successful submission ---------- */
private _resetForm(): void {
  this.hotelRating = 0;
  this.amenities.forEach(a => a.selected = false);
  this.feedbackText = '';
  this.isLoading = false;
}


toggleModal(): void {
  if (!this.authService.isLoggedIn()) {
    this.showModal = !this.showModal;
  }
}

closeModal(): void {
  this.showModal = false;
}
scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

}

