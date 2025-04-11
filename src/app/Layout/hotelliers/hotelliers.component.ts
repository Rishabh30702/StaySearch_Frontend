import { Component, HostListener, OnDestroy, OnInit,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from './room.service';
import { Room } from './room.modal';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Feedback } from './feedback.modal';
import { FeedbackService } from './feedback.service';

@Component({
  selector: 'app-hotelliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotelliers.component.html',
  styleUrl: './hotelliers.component.css'
})
export class HotelliersComponent implements OnInit,OnDestroy {

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isSidebarCollapsed = false;
  selectedMenu: string = 'dashboard';
  showDropdown = false;
  todayDate = new Date().toDateString();

  editMode = false;
  selectedRoomIndex: number | null = null;
  updatedPrice: number = 0;

  rooms: Room[] = [];
  roomStatus = { occupied: 0, available: 0 };

  editIndex: number | null = null;
  //Review and Feedbacks
  feedbacks: Feedback[] = [];


  menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { key: 'rooms', label: 'Rooms', icon: 'fas fa-bed' },
    { key: 'deal', label: 'Deal', icon: 'fas fa-tags' },
    { key: 'rate', label: 'Rate', icon: 'fas fa-rupee-sign' },
    { key: 'feedbacks', label: 'Review & Feedbacks', icon: 'fas fa-comments' }
  ];

  overviewStats = [
    { label: 'Total Bookings', value: 154 },
    { label: 'Active Rooms', value: 0 },
    { label: 'Reviews', value: 320 },
  ];

  showDealForm = false;
  showAddRoomForm = false;

  hotelId: number = 1; // Static hotel ID for now

  newDeal: Room = {
    name: '',
    price: 0,
    total: 0,
    available: 0,
    deal: true,
    description: '',
    imageUrl: ''
  };
  newRoom: Room = {
    name: '',
    available: 0,
    total: 0,
    price: 0,
    deal: false,
    imageUrl: ''
  };
  
  selectedFile!: File;

  constructor(private roomService: RoomService, private http: HttpClient,
    private feedbackService: FeedbackService) {}


  ngOnDestroy(): void {
    this.destroy();
  }

  ngOnInit(): void {
    this.loadRooms();
    this.fetchFeedbacks();

    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };


    const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;

    if (role === 'Hotelier') {
      // This is a hotelier trying to access user home
      localStorage.removeItem('token');
      localStorage.removeItem('role');

      Swal.fire({
        icon: 'info',
        title: 'Session Ended',
        text: 'You were logged in as a hotelier. Please log in as a user.',
        confirmButtonText: 'OK'
      }).then(() => {
        location.reload(); // or navigate to login
      });
    }
  }

  }

  destroy(){
    Swal.fire({
      title: 'You are about to sign out!',
      text: 'Do you want to clear your session?',
      icon: 'warning',
      allowEscapeKey() {
        return false;
      },
      allowOutsideClick() {
        return false;
      },
      showCancelButton: true,
      confirmButtonText: 'Yes, I know',
      cancelButtonText: 'Stay'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
      }
    });
  }

 
  fetchFeedbacks(): void {
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (data) => {
        this.feedbacks = data;
      },
      error: (err) => {
        console.error('Error fetching feedbacks:', err);
      }
    });
  }

  createStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  deleteFeedback(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this feedback!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.feedbackService.deleteFeedback(id, { responseType: 'text' as 'json' }).subscribe({
          next: () => {
            this.feedbacks = this.feedbacks.filter(f => f.id !== id);
            Swal.fire('Deleted!', 'Feedback has been deleted.', 'success');
          },
          error: () => {
            Swal.fire('Error!', 'Could not delete feedback.', 'error');
          }
        });
      }
    });
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
    Swal.fire({
      title: 'You are about to sign out!',
      text: 'Do you want to clear your session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, I know',
      cancelButtonText: 'Stay'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
      }
    });
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
            this.newDeal = { name: '', price: 0, total: 0, available: 0, deal: true, description: '', imageUrl: '' };
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

  toggleDescription(index: number) {
  this.rooms[index].showFullDesc = !this.rooms[index].showFullDesc;
}


onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.newRoom.imageUrl = reader.result as string; // Data URL
    };
    reader.readAsDataURL(this.selectedFile);
  }
}


  addRoom() {
    if (this.newRoom.name && this.newRoom.available >= 0 && this.newRoom.total > 0 && this.newRoom.price > 0 && this.selectedFile) {

      const formData = new FormData();
      formData.append('room', new Blob([JSON.stringify(this.newRoom)], { type: 'application/json' }));
      formData.append('imageUrl', this.selectedFile);

      this.roomService.addRoom(this.hotelId, formData).subscribe({
        next: (addedRoom: Room) => {
          this.rooms.push(addedRoom);
          this.newRoom = { name: '', available: 0, total: 0, price: 0, deal: false, imageUrl: '' };
          this.selectedFile = null!;
          this.showAddRoomForm = false;
          alert('Room added successfully!');
          this.updateStats();
        },
        error: (err: any) => {
          console.error(err);
          alert('Failed to add room.');
        }
      });
    } else {
      alert('Please fill all fields and select an image!');
    }
  }


  deleteRoom(roomId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This room will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.roomService.deleteRoom(roomId).subscribe({
          next: () => {
            this.rooms = this.rooms.filter(r => r.id !== roomId);
            Swal.fire('Deleted!', 'The room has been deleted.', 'success');
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to delete room.', 'error');
          }
        });
      }
    });
  }

  editRoom(index: number) {
    this.editIndex = index;
    // You can deep copy the room if you want to isolate it
    this.newRoom = { ...this.rooms[index] };
  }

  cancelEditRoomPopup(): void {
    this.editIndex = null;
  this.newRoom = {
    name: '',
    price: 0,
    total: 0,
    available: 0,
    deal: false,
    description: '',
    imageUrl: ''
  };
  }
  


  updateRoom() {
    if (this.newRoom.id === undefined) return;
  
    if (
      this.newRoom.name &&
      this.newRoom.available >= 0 &&
      this.newRoom.total > 0 &&
      this.newRoom.price > 0
    ) {
      // Create a shallow copy excluding the preview image URL
      const roomDataToSend = { ...this.newRoom, imageUrl: null }; // remove base64
  
      const formData = new FormData();
      formData.append(
        'room',
        new Blob([JSON.stringify(roomDataToSend)], {
          type: 'application/json',
        })
      );
  
      if (this.selectedFile) {
        formData.append('imageUrl', this.selectedFile);
      }
  
      this.roomService.updateRoom(this.newRoom.id, formData).subscribe({
        next: (updatedRoom: Room) => {
          if (this.editIndex !== null) {
            this.rooms[this.editIndex] = updatedRoom;
          }
          this.editIndex = null;
          this.newRoom = {
            name: '',
            price: 0,
            total: 0,
            available: 0,
            deal: false,
            description: '',
            imageUrl: '',
          };
          this.selectedFile = null!;
          Swal.fire('Success', 'Room updated successfully!', 'success');
          this.updateStats();
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', 'Failed to update room.', 'error');
        },
      });
    } else {
      alert('Please fill all fields!');
    }
  }
  
  //deals crd
  editRoomById(roomId: number) {
    const index = this.rooms.findIndex(r => r.id === roomId);
    if (index !== -1) {
      this.editRoom(index);
    }
  }
  


  loadRooms() {
    this.roomService.getRooms(this.hotelId).subscribe((data: Room[]) => {
      this.rooms = data.map(room => ({
        ...room,
        showFullDesc: false // 👈 Add this UI field
      }));
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
