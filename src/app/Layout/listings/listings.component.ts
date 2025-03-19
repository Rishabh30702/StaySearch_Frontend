import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { HotelFilterComponent } from "../../Core/hotel-filter/hotel-filter.component";
import { HotelListingService } from '../../Core/Services/hotel-listing.service';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";

@Component({
  selector: 'app-listings',
  imports: [CommonModule, HotelFilterComponent, SpinnerComponent],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.css'
})
export class ListingsComponent implements AfterViewInit, OnInit {
  hotels: any[] = [];
  hasApiKey = false; // Change to 'true' if you have a Google Maps API Key
  map: any; // Store the map instance

  filteredHotels: any[] = []; // Filtered list of hotels
  isLoading: boolean = true;
  constructor(private sanitizer: DomSanitizer, private router: Router,
     private route: ActivatedRoute, private hotellisttingservice: HotelListingService) {
    this.hotels = [
      // {
      //   hotel_id: 5,
      //   name: 'Sydney Beach House',
      //   destination: 'Sydney',
      //   description: 'Relaxing stay near Sydney’s famous beaches.',
      //   price: '$200',
      //   image: 'waterfront.jpg',
      //   lat: -33.8688,
      //   lng: 151.2093,
      //   rating: 3.5,
      //   reviews: "38 reviews",
      //   liked: false,
      //   address: "Sydney, Australia",
      //   checkIn: '2025-07-05',
      //   checkOut: '2025-07-12',
      //   guests: 2,
      //   rooms: 1
      // }
    ];
    this.hotellisttingservice.getHotels().subscribe((data: any) => {
      console.log(data);
      this.hotels = data;
      this.filteredHotels = [...this.hotels]; // ✅ Ensure filteredHotels is updated
      this.initializeMaps(); // ✅ Initialize maps AFTER hotels are loaded
      this.isLoading = false;
    }, error=>{
      console.log(error);
      this.isLoading = false;
    });
    
  }
  ngOnInit(): void {
    this.filteredHotels = [...this.hotels]; // Start with all hotels
  
    this.route.queryParams.subscribe(params => {
      let matchedHotels = this.hotels.filter(hotel => {
        const matchesDestination = !params['destination'] || hotel.destination.toLowerCase().includes(params['destination'].toLowerCase());
        const matchesCheckIn = !params['checkIn'] || hotel.checkIn === params['checkIn'];
        const matchesCheckOut = !params['checkOut'] || hotel.checkOut === params['checkOut'];
        const matchesGuests = !params['guests'] || +hotel.guests >= +params['guests'];
        const matchesRooms = !params['rooms'] || +hotel.rooms >= +params['rooms'];
  
        return matchesDestination && matchesCheckIn && matchesCheckOut && matchesGuests && matchesRooms;
      });
  
      let remainingHotels = this.hotels.filter(hotel => !matchedHotels.includes(hotel));
  
      // Show searched result first, then remaining hotels
      this.filteredHotels = [...matchedHotels, ...remainingHotels];
    });
  }
  
  
  sortHotelsBySearch(destination: string): void {
    const index = this.filteredHotels.findIndex(hotel => 
      hotel.destination.toLowerCase() === destination.toLowerCase()
    );
  
    if (index !== -1) {
      const [matchedHotel] = this.filteredHotels.splice(index, 1);
      this.filteredHotels.unshift(matchedHotel);
    }
  }
  
  ngAfterViewInit(): void {
   
  }

  initializeMaps(): void {
    setTimeout(() => {  // Ensure the DOM is ready
      this.hotels.forEach((hotel, index) => {
        const mapId = `map-${index}`; // Unique ID for each map
        const mapContainer = document.getElementById(mapId);
        
        if (mapContainer) {
          const map = L.map(mapId).setView([hotel.lat, hotel.lng], 13);
  
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: ''
          }).addTo(map);
  
          L.marker([hotel.lat, hotel.lng], {
            icon: L.icon({
              iconUrl: 'marker-icon.png',
              shadowUrl: 'marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }).addTo(map).bindPopup(`<b>${hotel.name}</b>`);
        }
      });
    }, 300);  // Small delay ensures DOM is updated
  }

  toggleLike(hotel: any) {
    setTimeout(() => {
      hotel.liked = !hotel.liked;
    });
  }
  onHotelClick(hotel: any) {
    this.router.navigate(['listings/overview'], { queryParams: hotel });
    return hotel.liked ? 'favorite' : 'favorite_border';

  }
  getShortDescription(description: string): string {
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }
  applyFilter(filters: any) {
    console.log("Filters applied:", filters);
    
    // Example: Filtering hotels based on price, star rating, and amenities
    this.filteredHotels = this.hotels.filter(hotel => {
      return (
        hotel.price <= filters.price &&
        (!filters.star || filters.star[hotel.rating]) &&
        (!filters.amenities || Object.keys(filters.amenities).every(a => !filters.amenities[a] || hotel.amenities.includes(a)))
      );
    });
  }

}
