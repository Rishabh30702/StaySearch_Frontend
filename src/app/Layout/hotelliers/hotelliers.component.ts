import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotelliers',
  imports: [CommonModule],
  templateUrl: './hotelliers.component.html',
  styleUrl: './hotelliers.component.css'
})
export class HotelliersComponent {
  isSidebarCollapsed = false;
  selectedMenu:String = 'dashboard';
  showDropdown = false;
  todayDate = new Date().toDateString();

  menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { key: 'rooms', label: 'Rooms', icon: 'fas fa-bed' },
    { key: 'deal', label: 'Deal', icon: 'fas fa-tags' },
    { key: 'rate', label: 'Rate', icon: 'fas fa-rupee-sign' },
  ];

  overviewStats = [
    { label: 'Total Bookings', value: 154 },
    { label: 'Active Rooms', value: 68 },
    { label: 'Reviews', value: 320 },
  ];

  rooms = [
    { type: 'Deluxe', available: 5, total: 10, price: 2000, deal: true },
    { type: 'Standard', available: 2, total: 6, price: 1500 },
    { type: 'Suite', available: 0, total: 4, price: 3000 },
  ];
  
  roomStatus = {
    occupied: 15,
    available: 7,
  };
  

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectMenu(menu: string) {
    this.selectedMenu = menu;
  }

  toggleProfileDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    alert('Logged out!');
  }

}
