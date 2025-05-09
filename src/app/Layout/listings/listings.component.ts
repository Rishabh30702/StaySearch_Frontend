import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { debounceTime } from 'rxjs/operators';
import { HotelFilterComponent } from "../../Core/hotel-filter/hotel-filter.component";
import { HotelListingService } from '../../Core/Services/hotel-listing.service';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, HotelFilterComponent, SpinnerComponent],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.css'
})
export class ListingsComponent implements AfterViewInit, OnInit {
  hotels: any[] = [];
  filteredHotels: any[] = [];
  isLoading: boolean = true;
  map: any;
  marker: any;

  constructor(
    private sanitizer: DomSanitizer, 
    private router: Router,
    private route: ActivatedRoute, 
    private hotelListingService: HotelListingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Fetch Hotels Before Applying Filters
    this.hotelListingService.getHotels().subscribe(
      (data: any) => {
        if (!Array.isArray(data)) {
          console.error("API response is not an array:", data);
          return;
        }
         this.hotels = data;
         // ✅ Shuffle hotels randomly
      // this.hotels = this.shuffleArray(data);
        this.filteredHotels = [...this.hotels];
        this.isLoading = false;

        // ✅ Apply Filters AFTER Data is Loaded
        this.route.queryParams.subscribe(params => {
          console.log("Query Params Received:", params);
          this.applyFilters(params);
        });
      },
      (error: any) => {
        console.error("❌ Error fetching hotels:", error);
        this.isLoading = false;
      }
    ); 
  }


  
// Utility method to shuffle an array
/*private shuffleArray(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}*/


applyFilters(params: any): void {
  console.log("Applying Filters with Params:", params);

  const destinationInput = params['destination']?.toLowerCase().trim() || '';

  // Stage 1: Try destination match
  let primaryMatches = this.hotels.filter(hotel =>
    hotel.destination?.toLowerCase().includes(destinationInput)
  );

  // Stage 2: Fallback to name match if no destination matches
  if (primaryMatches.length === 0 && destinationInput) {
    primaryMatches = this.hotels.filter(hotel =>
      hotel.name?.toLowerCase().includes(destinationInput)
    );
  }

  // Stage 3: Apply other filters
  const filteredMatches = primaryMatches.filter(hotel => {
    const matchesCheckIn = !params['checkInDate'] || hotel.checkIn === params['checkInDate'];
    const matchesCheckOut = !params['checkOutDate'] || hotel.checkOut === params['checkOutDate'];
    const matchesGuests = !params['guests'] || Number(params['guests']) <= 1 || +hotel.guests >= Number(params['guests']);
    const matchesRooms = !params['rooms'] || Number(params['rooms']) <= 1 || +hotel.rooms >= Number(params['rooms']);

    return matchesCheckIn && matchesCheckOut && matchesGuests && matchesRooms;
  });

  // Stage 4: Add remaining hotels below the matched ones (optional)
  const remainingHotels = this.hotels.filter(hotel =>
    !filteredMatches.some(matched => matched.hotelId === hotel.hotelId)
  );

  this.filteredHotels = [...filteredMatches, ...remainingHotels];

  console.log("✅ Filtered Hotels (Destination/Name matches first):", this.filteredHotels);
  this.updateMapToNearbyHotels();
}



  
  
  
  
  sortHotelsBySearch(destination: string): void {
    const matchingHotels = this.filteredHotels.filter(hotel =>
      hotel.destination?.toLowerCase() === destination.toLowerCase()
    );

    const nonMatchingHotels = this.filteredHotels.filter(hotel =>
      hotel.destination?.toLowerCase() !== destination.toLowerCase()
    );

    this.filteredHotels = [...matchingHotels, ...nonMatchingHotels]; // ✅ Ensures matched hotels are on top
  }
  

  ngAfterViewInit(): void {
    this.initializeMap();
  }
 
  initializeMap(): void {
    setTimeout(() => {
      const mapContainer = document.getElementById('main-map');

      if (!mapContainer) {
        console.error('❌ Map container not found!');
        return;
      }

      this.map = L.map('main-map').setView([27.1767, 78.0081], 6); // Default to Agra
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      console.log('✅ Map initialized successfully!');
    }, 500);
  }


  highlightHotelOnMap(hotel: any, zoomLevel: number = 12): void {
    if (!this.map) return;
  
    // ✅ Remove previous marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
  
    // ✅ Create a new marker with highlighted style
    this.marker = L.marker([hotel.lat, hotel.lng], {
      icon: L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background: #761461; color: white; padding: 5px 10px;width:80px; border-radius: 8px; 
                       box-shadow: 0px 0px 8px rgba(0,0,0,0.2); font-weight: bold;">
                ${hotel.price}/night
              </div>`,
        iconSize: [60, 20]
      })
    }).addTo(this.map);
  
    // ✅ Zoom out slightly to show nearby hotels
    this.map.setView([hotel.lat, hotel.lng], zoomLevel);
  }
  
  

  updateMapToNearbyHotels(): void {
    if (!this.map || this.filteredHotels.length === 0) return;
  
    // ✅ Ensure all lat/lng values are valid numbers
    const hotelLocations: [number, number][] = this.filteredHotels
      .filter(hotel => typeof hotel.lat === 'number' && typeof hotel.lng === 'number')
      .map(hotel => [hotel.lat, hotel.lng]);
  
    if (hotelLocations.length === 0) return;
  
    if (hotelLocations.length === 1) {
      this.map.setView(hotelLocations[0], 13);
    } else {
      const bounds = L.latLngBounds(hotelLocations);
      this.map.fitBounds(bounds, { padding: [50, 50] }); // ✅ Ensures all hotels are visible
    }
  
    // ✅ Remove old markers before adding new ones
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  
    // ✅ Add markers for all hotels
    this.filteredHotels.forEach(hotel => {
      if (typeof hotel.lat !== 'number' || typeof hotel.lng !== 'number') return;
  
      hotel.marker = L.marker([hotel.lat, hotel.lng], {
        icon: L.divIcon({
          className: 'custom-map-marker',
          html: `<div id="marker-${hotel.hotelId}" 
                  style="background: white; padding: 5px 10px; border-radius: 8px; 
                         box-shadow: 0px 0px 8px rgba(0,0,0,0.2); font-weight: bold;">
                  ${hotel.price}/night
                 </div>`,
          iconSize: [60, 20]
        })
      }).addTo(this.map);
    });
  }
  
  
  

  toggleLike(hotel: any): void {
    const hotelId = hotel.hotelId;
    
    if (!hotelId) {
      console.error('❌ Hotel ID is missing!');
      Swal.fire({ text: '❌ Hotel ID is missing!', title: 'Error', icon: 'error' });
      return;
    }
  
    hotel.loading = true; // loader for this specific hotel item
  
    if (hotel.liked) {
      this.authService.removeFromWishlist(hotelId).subscribe({
        next: () => {
          hotel.liked = false;
          Swal.fire({ text: '❌ Removed from wishlist', title: 'Success', icon: 'success' });
          hotel.loading = false;
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
          hotel.loading = false;
        }
      });
    } else {
      this.authService.addToWishlist(hotelId).subscribe({
        next: () => {
          hotel.liked = true;
          Swal.fire({ text: '❤️ Added to wishlist', title: 'Success', icon: 'success' });
          hotel.loading = false;
        },
        error: (err) => {
          console.error('Error adding to wishlist:', err);
          hotel.loading = false;
        }
      });
    }
  }
  
  
  onHotelClick(hotel: any): void {
    // ✅ Reset filters by clearing query parameters
    this.router.navigate(['listings/overview'], { 
      queryParams: { hotelId: hotel.hotelId },
      queryParamsHandling: 'merge'  // Keeps only `hotelId` and removes others
    });
  
    // ✅ Reset filteredHotels to the full hotel list
    this.filteredHotels = [...this.hotels];
  
    console.log("🔄 Filters Reset, Showing All Hotels");
  }
  
  
  
  /**
   * Returns a shortened hotel description for display.
   */
  getShortDescription(description: string): string {
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }

  /**
   * Filters hotels based on price, star rating, and amenities.
   */
  applyFilter(filters: any): void {
    console.log("Filters received:", filters);
  
    if (!this.hotels || this.hotels.length === 0) {
      console.warn("⚠️ No hotels available to filter.");
      this.filteredHotels = [];
      return;
    }
  
    const maxPrice: number = filters.price ?? Infinity;
    const selectedTypes: string[] = filters.accommodationTypes ?? []; // new line
  
    this.filteredHotels = this.hotels.filter((hotel: any) => {
      const withinPriceRange = hotel.price >= 0 && hotel.price <= maxPrice;
  
      // ⭐ Star filter
      let matchesStar = true;
      if (filters.star && Object.keys(filters.star).length > 0) {
        const selectedStars: number[] = Object.keys(filters.star)
          .filter((star: string) => filters.star[star])
          .map((star: string) => Number(star));
        matchesStar = selectedStars.length === 0 || selectedStars.some((star: number) => hotel.rating >= star);
      }
  
      // 🧼 Amenities filter
      let matchesAmenities = true;
      if (filters.amenities && Object.keys(filters.amenities).length > 0) {
        const selectedAmenities: string[] = Object.keys(filters.amenities)
          .filter((a: string) => filters.amenities[a])
          .map((a: string) => a.toLowerCase().replace(/-/g, ""));
        if (!Array.isArray(hotel.amenities)) {
          matchesAmenities = false;
        } else {
          const hotelAmenitiesNormalized: string[] = hotel.amenities.map((a: string) =>
            a.toLowerCase().replace(/-/g, "")
          );
          matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every((a: string) => hotelAmenitiesNormalized.includes(a));
        }
      }
  
     // 🏨 Accommodation type filter
        let matchesAccomodationType = true;
        if (selectedTypes.length > 0) {
          matchesAccomodationType = selectedTypes.includes(hotel.accommodationType);
        }
          
      return withinPriceRange && matchesStar && matchesAmenities && matchesAccomodationType;
    });
  
    console.log("✅ Filtered Hotels:", this.filteredHotels);
  }
  

}

