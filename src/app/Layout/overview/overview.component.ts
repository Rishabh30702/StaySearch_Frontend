import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";

@Component({
  selector: 'app-overview',
  imports: [CommonModule, SpinnerComponent],
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
  expandedRooms: { [key: string]: boolean } = {}; // Track expanded rooms
  isLoading: boolean = true;
  @ViewChildren('desc') descriptions!: QueryList<ElementRef>;

  
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

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
    console.log("Fetching from API:", apiUrl); // Debugging

    this.http.get(apiUrl).subscribe(
      (data: any) => {
        console.log("Fetched Hotel Data:", data); // Debugging

        if (data) {
          this.hotel = {
            ...data,
            latitude: data.lat, // Fix lat mapping
            longitude: data.lng // Fix lng mapping
          };
          this.isLoading = false

          // Ensure arrays are properly initialized
          this.hotel.amenities = Array.isArray(data.amenities) ? data.amenities : [];
          this.hotel.rooms = Array.isArray(data.rooms) ? data.rooms : [];

          setTimeout(() => this.loadMap(), 500); // Load map after data is fetched
          this.isLoading = false
        } else {
          console.error("Invalid API response", data);
          this.isLoading = false
        }
      },
      (error) => {
        console.error("Error fetching hotel data:", error);
        this.isLoading = false
      }
    );
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

  toggleRoomExpansion(roomName: string) {
    this.expandedRooms[roomName] = !this.expandedRooms[roomName];

    if (this.expandedRooms[roomName]) {
      setTimeout(() => {
        const expandedRoom = document.getElementById(roomName);
        if (expandedRoom) {
          expandedRoom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }
}
