import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelListingService } from '../Services/hotel-listing.service';

@Component({
  selector: 'app-hotel-filter',
  imports: [CommonModule,FormsModule],
  templateUrl: './hotel-filter.component.html',
  styleUrls: ['./hotel-filter.component.css']
})
export class HotelFilterComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();

  filters = {
    price: 5000,
    star: {} as { [key: number]: boolean },
    amenities: {} as { [key: string]: boolean }
  };
  amenitiesList: string[] = ['Wi-Fi', 'Parking', 'Pool', 'Gym'];
  hotels: any[] = [];

  constructor(private hotelListingService: HotelListingService) {}

  ngOnInit(): void {
    this.hotelListingService.getHotels().subscribe((data: any) => {
      this.hotels = data;
      console.log("Hotels Data:", this.hotels);
    });
  }

  applyFilters() {
    console.log("Filters applied:", this.filters);
    this.filtersChanged.emit(this.filters);
  }
}