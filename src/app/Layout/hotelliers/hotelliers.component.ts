import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from './room.service';
import { Room } from './room.modal';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hotelliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotelliers.component.html',
  styleUrl: './hotelliers.component.css'
})
export class HotelliersComponent implements OnInit {
  isSidebarCollapsed = false;
  selectedMenu: string = 'dashboard';
  showDropdown = false;
  todayDate = new Date().toDateString();

  editMode = false;
  selectedRoomIndex: number | null = null;
  updatedPrice: number = 0;

  rooms: Room[] = [];
  roomStatus = { occupied: 0, available: 0 };

  menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { key: 'rooms', label: 'Rooms', icon: 'fas fa-bed' },
    { key: 'deal', label: 'Deal', icon: 'fas fa-tags' },
    { key: 'rate', label: 'Rate', icon: 'fas fa-rupee-sign' },
  ];

  overviewStats = [
    { label: 'Total Bookings', value: 154 },
    { label: 'Active Rooms', value: 0 },
    { label: 'Reviews', value: 320 },
  ];

  showDealForm = false;
  showAddRoomForm = false;

  hotelId: number = 1; // Static hotel ID for now

  newDeal: Room = { name: '', price: 0, total: 0, available: 0, deal: true, description: '' };
  newRoom: Room = { name: '', price: 0, total: 0, available: 0, deal: false, description: '' };
  
  selectedFile!: File;

  constructor(private roomService: RoomService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectMenu(menu: string) {
    this.selectedMenu = menu;
    if (menu === 'rooms') {
      this.loadRooms(); // Load fresh data from DB when "rooms" is selected
    }
  }

  toggleProfileDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    alert('Logged out!');
  }

  toggleDealForm() {
    this.showDealForm = !this.showDealForm;
  }

  createDeal() {
    if (this.newDeal.name.trim() && this.newDeal.price > 0 && this.newDeal.total > 0 && this.selectedFile) {
      const formData = new FormData();
      const roomBlob = new Blob([JSON.stringify(this.newDeal)], { type: 'application/json' });
  
      formData.append('room', roomBlob);
      formData.append('image', this.selectedFile);
  
      this.http.post<Room>(`http://localhost:8080/api/hotels/${this.hotelId}/rooms`, formData)
        .subscribe({
          next: (addedRoom: Room) => {
            this.rooms.push(addedRoom);
            this.newDeal = { name: '', price: 0, total: 0, available: 0, deal: true };
            this.showDealForm = false;
            this.selectedFile = undefined!;
            alert('Deal added successfully!');
            this.updateStats();
          },
          error: (err) => {
            console.error(err);
            alert('Failed to add deal room with image.');
          }
        });
    } else {
      alert('Please fill all required fields and upload an image!');
    }
  }

  get filteredDeals(): Room[] {
    return this.rooms.filter(r => r.deal && r.name && r.price && r.total);
  }

  enableEdit(index: number, currentPrice: number) {
    this.editMode = true;
    this.selectedRoomIndex = index;
    this.updatedPrice = currentPrice;
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedRoomIndex = null;
    this.updatedPrice = 0;
  }

  saveRate(index: number) {
    if (this.updatedPrice > 0) {
      this.rooms[index].price = this.updatedPrice;
      this.cancelEdit();
      alert('Rate updated successfully!');
    } else {
      alert('Please enter a valid price!');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addRoom() {
    if (this.newRoom.name && this.newRoom.available >= 0 && this.newRoom.total > 0 && this.newRoom.price > 0) {
      this.roomService.addRoomWithoutImage(this.hotelId, this.newRoom).subscribe({
        next: (addedRoom: Room) => {
          this.rooms.push(addedRoom);
          this.newRoom = { name: '', available: 0, total: 0, price: 0, deal: false };
          this.showAddRoomForm = false;
          alert('Room added successfully!');
          this.updateStats();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to add room.');
        }
      });
    } else {
      alert('Please fill all fields correctly!');
    }
  }

  loadRooms() {
    this.roomService.getRooms(this.hotelId).subscribe((data: Room[]) => {
      this.rooms = data;
      this.updateStats();
    });
  }

  updateStats() {
    const available = this.rooms.reduce((sum, r) => sum + r.available, 0);
    const total = this.rooms.reduce((sum, r) => sum + r.total, 0);
    this.roomStatus.available = available;
    this.roomStatus.occupied = total - available;
    this.overviewStats[1].value = total;
  }
}
