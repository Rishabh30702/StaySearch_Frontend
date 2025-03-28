import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { debounceTime } from 'rxjs/operators';
import { HotelFilterComponent } from "../../Core/hotel-filter/hotel-filter.component";
import { HotelListingService } from '../../Core/Services/hotel-listing.service';
import { SpinnerComponent } from "../../Core/spinner/spinner.component";

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
    private hotelListingService: HotelListingService
  ) {}

  ngOnInit(): void {
    // ✅ Fetch Hotels Before Applying Filters
    this.hotelListingService.getHotels().subscribe(
      (data: any) => {
        if (!Array.isArray(data)) {
          console.error("❌ API response is not an array:", data);
          return;
        }
        this.hotels = data;
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

  applyFilters(params: any): void {
    console.log("Applying Filters with Params:", params);
  
    let matchedHotels = this.hotels.filter(hotel => {
      const matchesDestination = !params['destination'] || 
        (hotel.destination?.toLowerCase().trim() === params['destination'].toLowerCase().trim());
  
      const matchesCheckIn = !params['checkInDate'] || hotel.checkIn === params['checkInDate'];
      const matchesCheckOut = !params['checkOutDate'] || hotel.checkOut === params['checkOutDate'];
      const matchesGuests = !params['guests'] || +hotel.guests >= Number(params['guests']);
      const matchesRooms = !params['rooms'] || +hotel.rooms >= Number(params['rooms']);
  
      return matchesDestination && matchesCheckIn && matchesCheckOut && matchesGuests && matchesRooms;
    });
  
    let remainingHotels = this.hotels.filter(hotel => 
      !matchedHotels.some(matched => matched.hotelId === hotel.hotelId)
    );
  
    this.filteredHotels = [...matchedHotels, ...remainingHotels];
  
    console.log("✅ Filtered Hotels (Searched on top):", this.filteredHotels);
  
    // ✅ Update the map to focus on the first search result
    this.updateMapToFirstResult();
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

  updateMapToFirstResult(): void {
    if (!this.map || this.filteredHotels.length === 0) return;
  
    const firstHotel = this.filteredHotels[0];
  
    // ✅ Ensure the hotel has valid coordinates
    if (!firstHotel.lat || !firstHotel.lng) return;
  
    // ✅ Set the map to the top hotel’s location
    this.map.setView([firstHotel.lat, firstHotel.lng], 13);
  
    // ✅ Update marker on the map
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
  
    this.marker = L.marker([firstHotel.lat, firstHotel.lng], {
      icon: L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background: white; padding: 5px 10px; border-radius: 8px; box-shadow: 0px 0px 8px rgba(0,0,0,0.2); font-weight: bold;">
                ${firstHotel.price}/night
               </div>`,
        iconSize: [60, 20]
      })
    }).addTo(this.map);
  }
  
  

  highlightHotelOnMap(hotel: any): void {
    if (!this.map) return;
  
    // ✅ Remove previous marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
  
    // ✅ Create a new marker for the hovered hotel
    this.marker = L.marker([hotel.lat, hotel.lng], {
      icon: L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background: white; padding: 5px 10px; border-radius: 8px; box-shadow: 0px 0px 8px rgba(0,0,0,0.2); font-weight: bold;">
                ${hotel.price}/night
               </div>`,
        iconSize: [60, 20]
      })
    }).addTo(this.map);
  
    // ✅ Move map to hovered hotel’s location
    this.map.setView([hotel.lat, hotel.lng], 13);
  }
  

  toggleLike(hotel: any): void {
    setTimeout(() => {
      hotel.liked = !hotel.liked;
    });
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
    console.log("🔍 Filtering hotels with price <= ", maxPrice);

    this.filteredHotels = this.hotels.filter((hotel: any) => {
        const withinPriceRange = hotel.price >= 0 && hotel.price <= maxPrice;

        console.log(`🔎 Checking Hotel: ${hotel.name}`);
        console.log("Hotel Amenities:", hotel.amenities);

        // ✅ Star rating check (Fixed)
        let matchesStar = true;
        if (filters.star && Object.keys(filters.star).length > 0) {
            const selectedStars: number[] = Object.keys(filters.star)
                .filter((star: string) => filters.star[star])
                .map((star: string) => Number(star));

            // If no star is selected, allow all hotels
            matchesStar = selectedStars.length === 0 || selectedStars.some((star: number) => hotel.rating >= star);
        }

        // ✅ Amenities filter (Fixed)
        let matchesAmenities = true;
        if (filters.amenities && Object.keys(filters.amenities).length > 0) {
            const selectedAmenities: string[] = Object.keys(filters.amenities)
                .filter((a: string) => filters.amenities[a])
                .map((a: string) => a.toLowerCase().replace(/-/g, "")); // 🔥 Normalize filter input

            console.log("Selected Amenities (normalized):", selectedAmenities);

            if (!Array.isArray(hotel.amenities)) {
                console.warn(`🚨 Hotel ${hotel.name} has invalid amenities field!`);
                matchesAmenities = false;
            } else {
                const hotelAmenitiesNormalized: string[] = hotel.amenities.map((a: string) =>
                    a.toLowerCase().replace(/-/g, "")
                ); // 🔥 Normalize hotel amenities

                matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every((a: string) => hotelAmenitiesNormalized.includes(a));
            }

            console.log(`✅ Hotel ${hotel.name} matches amenities: ${matchesAmenities}`);
        }

        return withinPriceRange && matchesStar && matchesAmenities;
    });

    console.log("✅ Filtered Hotels:", this.filteredHotels);
}

}

