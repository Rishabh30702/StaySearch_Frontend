import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotel-filter',
  imports: [CommonModule,FormsModule],
  templateUrl: './hotel-filter.component.html',
  styleUrls: ['./hotel-filter.component.css']
})
export class HotelFilterComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  filters = {
    price: 5000,
    star: {} as { [key: number]: boolean },  // Define star object type properly
    amenities: {} as { [key: string]: boolean }
  };

  amenitiesList = ['Wi-Fi', 'Parking', 'Pool', 'Gym'];

  applyFilters() {
    this.filtersChanged.emit(this.filters);
  }
}
