import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
  hotel: any;
  private map: any;
  activeTab: string = 'overview';

  expandedRooms: { [key: string]: boolean } = {}; // Track expanded rooms
  @ViewChildren('desc') descriptions!: QueryList<ElementRef>;


  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Ensure params are converted to an object properly
      this.hotel = { ...params,
        latitude: params['lat'] ? parseFloat(params['lat']) : 27.1751,  // Default: Taj Mahal
        longitude: params['lng'] ? parseFloat(params['lng']) : 78.0421
       };

      // Assign the subImages manually
      this.hotel.subImages = [
        'bor.jpeg',
        'waterfront.jpg',
        'bor.jpeg'
      ];

      // Ensure amenities exist
      this.hotel.amenities = [
        { name: 'Air Conditioning', icon: 'fa-solid fa-wind' },
        { name: 'Business Center', icon: 'fa-solid fa-briefcase' },
        { name: 'Clothing Iron', icon: 'fa-solid fa-shirt' },
        { name: 'Data Ports', icon: 'fa-solid fa-network-wired' },
        { name: 'Dry Cleaning', icon: 'fa-solid fa-soap' },
        { name: 'Hair Dryer', icon: 'fa-solid fa-wind' },
        { name: 'Meeting Rooms', icon: 'fa-solid fa-users' },
        { name: 'Outdoor Pool', icon: 'fa-solid fa-water-ladder' },
        { name: 'Parking Garage', icon: 'fa-solid fa-square-parking' },
        { name: 'Safe', icon: 'fa-solid fa-lock' },
        { name: 'Room Service', icon: 'fa-solid fa-bell-concierge' },
        { name: 'TV in Room', icon: 'fa-solid fa-tv' },
        { name: 'Voicemail', icon: 'fa-solid fa-voicemail' }
      ];
      this.hotel.rooms = [
        {
          name: "Deluxe Room",
          image: "deluxeroom.jpg",
          description: "Experience the perfect blend of comfort and elegance in our Deluxe Room. Featuring a plush king-size bed, modern decor, and a spacious layout, this room is designed for ultimate relaxation. Enjoy stunning city views, a private balcony, and top-notch amenities, including high-speed WiFi, a flat-screen TV, and a minibar. luxurious room with modern amenities and a stunning city view."
        },
        {
          name: "Executive Suite",
          image: "executiveroom.jpg",
          description: "Indulge in the height of luxury with our Executive Suite, featuring a spacious living area, elegant furnishings, and breathtaking city views. This suite includes a king-size bed, a stylish lounge, and a private workspace. Guests can enjoy exclusive amenities such as a complimentary breakfast, access to the executive lounge, and a premium minibar."
        },
        {
          name: "Family Room",
          image: "familyroom.jpg",
          description: "Our Superior Room offers a cozy retreat with sophisticated decor and modern furnishings. Perfect for business travelers and vacationers alike, this room includes a comfortable queen-size bed, a work desk, and a luxurious en-suite bathroom."
        }
      ];
      
    });
  }

  ngAfterViewInit(): void {
    this.descriptions.forEach((descElement, index) => {
      const descHeight = descElement.nativeElement.scrollHeight;
      const lineHeight = parseFloat(getComputedStyle(descElement.nativeElement).lineHeight);
      const maxLines = 3;
  
      if (descHeight > lineHeight * maxLines) {
        this.hotel.rooms[index].showExpandIcon = true;
      } else {
        this.hotel.rooms[index].showExpandIcon = false;
      }
    });

    setTimeout(() => {
      this.loadMap();
    }, 500);
  
  }

  toggleMap() {
    if (!this.hotel.latitude || !this.hotel.longitude) {
      console.error("Latitude and Longitude not available");
      return;
    }
  
    const lat = this.hotel.latitude;
    const lng = this.hotel.longitude;
  
    // Construct Google Maps URL
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  
    // Open the URL in a new tab
    window.open(googleMapsUrl, '_blank');
  }

  private loadMap(): void {
    if (!this.hotel.latitude || !this.hotel.longitude) {
      console.error("Latitude and Longitude not provided");
      return;
    }
  
    const lat = this.hotel.latitude;
    const lng = this.hotel.longitude;
  
    // Initialize map with dynamic coordinates
    this.map = L.map('map').setView([lat, lng], 13);
  
    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  
    // Add a marker
    L.marker([lat, lng]).addTo(this.map)
      .bindPopup(this.hotel.name || 'Hotel Location')
      .openPopup();
  }
  
  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeTab = sectionId; // Update active tab manually
    }
  }
  @HostListener('window:scroll', [])
  onScroll() {
    const sections = ['overview', 'amenities', 'rooms', 'location'];
    const scrollPosition = window.scrollY + 200; // Adjust offset for better accuracy

    for (const sectionId of sections) {
      const section = document.getElementById(sectionId);
      if (section && scrollPosition >= section.offsetTop) {
        this.activeTab = sectionId;
      }
    }
  }
  toggleRoomExpansion(roomName: string) {
    this.expandedRooms[roomName] = !this.expandedRooms[roomName];
  
    if (this.expandedRooms[roomName]) { // Only scroll if expanded
      setTimeout(() => {
        const expandedRoom = document.getElementById(roomName);
        if (expandedRoom) {
          expandedRoom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }
  
}
