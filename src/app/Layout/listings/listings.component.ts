import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-listings',
  imports: [CommonModule],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.css'
})
export class ListingsComponent implements AfterViewInit, OnInit {
  hotels: any[] = [];
  hasApiKey = false; // Change to 'true' if you have a Google Maps API Key
  map: any; // Store the map instance

  constructor(private sanitizer: DomSanitizer, private router: Router) {
    this.hotels = [
      {
        name: 'Bordeaux Getaway',
        description: "Bordeaux Getaway is a charming hotel nestled in the heart of Bordeaux, France. Offering a blend of modern comfort and classic French elegance, it provides guests with a relaxing retreat near the city top attractions. The hotel features well-appointed rooms, excellent amenities, and easy access to Bordeaux renowned vineyards, historic landmarks, and vibrant dining scene. Whether you visiting for leisure or business, Bordeaux Getaway ensures a memorable stay with warm hospitality and a serene ambiance.",
        price: '$225',
        image: 'bor.jpeg',
        lat: 44.8378,
        lng: -0.5792,
        rating: 4.5,
        reviews: "12 reviews",
        liked: false,  // Default value,
        address: "Bordeaux, France",
      },
      {
        name: 'Charming Waterfront Condo',
        description: 'Enjoy the sea view from this amazing condo.',
        price: '$200',
        image: 'waterfront.jpg',
        lat: 48.8566,
        lng: 2.3522,
        rating: 4.3,
        reviews: "14 reviews",
        liked: true,
        address: "Paris, France",
      },
      {
        name: 'New York Loft',
        description: 'Stylish loft in downtown Manhattan.',
        price: '$225',
        image: 'bor.jpeg',
        lat: 40.7128,
        lng: -74.0060,
        rating: 2.5,
        reviews: "29 reviews",
        liked: true,
        address: "New York, USA",
      },
      {
        name: 'Sydney Beach House',
        description: 'Relaxing stay near Sydney’s famous beaches.',
        price: '$200',
        image: 'waterfront.jpg',
        lat: -33.8688,
        lng: 151.2093,
        rating: 3.5,
        reviews: "38 reviews",
        liked: false,
        address: "Sydney, Australia",
      },
      
    ];
    
  }
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    this.hotels.forEach((hotel, index) => {
      const mapId = `map-${index}`; // Unique ID for each map
  
      setTimeout(() => { // Ensure the element is rendered before initializing Leaflet
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
      }, 100); // Small delay to ensure the DOM is ready
    });
  }


  toggleLike(hotel: any) {
    hotel.liked = !hotel.liked;
  }
  onHotelClick(hotel: any) {
    this.router.navigate(['listings/overview'], { queryParams: hotel });
    return hotel.liked ? 'favorite' : 'favorite_border';

  }
  getShortDescription(description: string): string {
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }
  

}
