import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RoomService } from './room.service';
import { Room } from './room.modal';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Feedback } from './feedback.modal';
import { FeedbackService } from './feedback.service';
import { SpinnerComponent } from '../../Core/spinner/spinner.component';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { LeafletMapService } from './services/leaflet-map.service';
import { AuthPortalService } from '../admin-access/AuthPortal.service';
import { HotelsService } from './services/hotels.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Core/Services/AuthService/services/auth.service';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { StripeService } from './services/stripe.service';


@Component({
  selector: 'app-hotelliers',
  standalone: true,
  imports: [CommonModule, FormsModule,SpinnerComponent],
  templateUrl: './hotelliers.component.html',
  styleUrl: './hotelliers.component.css'
})
export class HotelliersComponent implements OnInit,OnDestroy {
  @ViewChild('propertyNgForm') propertyNgForm!: NgForm;
  /* @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }*/

  latitude: number = 0;
  longitude: number = 0;
  mapInitialized = false;
  showmenu: boolean = true;
  today: Date = new Date();

   minDateTime: string ="";
maxDateTime: string="";


isLoading: boolean = false;
isDeal = false;
updateHotel = { name: '', address: '', amenities: '' };

isEditModalOpen =false;

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

  user ={
    phone: '',
    email:''
  };

  selectedAmenities: string[] = [];
  atLeastOneAmenitySelected: boolean = false;
  amenitiesTouched: boolean = false; 

  imageFiles: File[] = [];
  imagePreviews: string[] = [];
  
  roomImagePreview: string | null = null;
  poolImagePreview: string | null = null;
  lobbyImagePreview: string | null = null;

  subImages: string[] = [];

  selectedProperty: string = ''; 
  atLeastOnePropertyType: boolean = false; 
  propertyTypeTouched: boolean = false;
  

  // Example array of hotels
hotels = [
 {
    name: 'The Oberoi Amarvilas',
    location: 'Agra, Uttar Pradesh',
    rating: 4.8,
    amenities: ['Wi-Fi', 'Pool', 'AC'],
    id:0
  },
];

currentHotelName:string="";

  menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { key: 'hotels', label: 'Hotels', icon: 'fas fa-hotel' },
    { key: 'rooms', label: 'Rooms', icon: 'fas fa-bed' },
    { key: 'deal', label: 'Deal', icon: 'fas fa-tags' },
    { key: 'rate', label: 'Rate', icon: 'fas fa-rupee-sign' },
    { key: 'feedbacks', label: 'Review & Feedbacks', icon: 'fas fa-comments' },
    { key: 'profile', label: 'My profile', icon: 'fas fa-user' }
  ];

  overviewStats = [
    { label: 'Total Bookings', value: 154 },
    { label: 'Active Rooms', value: 0 },
    { label: 'Reviews', value: 320 },
  ];

  showDealForm = false;
  showAddRoomForm = false;

  // hotelId: number = 1; // Static hotel ID for now
  currentHotelId: number = 0;

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
    imageUrl: '',
  };

  resetRoomForm() {
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
    this.editIndex = null;
  }
  
  
  selectedFile!: File;



  userprofile = {
    fullName: '',
    email: '',
    contact: '',
    password: '',
    newPassword: '',
    
  };

  selectedHotel: any;


  discountInfo ={
        title:"",
        description:1,
        badge:"APP Exclusive",
        image:"",
        validFrom:"",
        validTill:""

      }

  username: string = '';
  UserFullname: string  = '';
  password: string ='';  
  phonenumber: number | null = null;

  dropdownOpen = false;
  searchText = '';
  selectedDistrict = '';
  @Output() clickOutside = new EventEmitter<void>();
  allDistricts: string[] = [
    'Agra', 'Aligarh', 'Allahabad', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh',
    'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
    'Bareilly', 'Basti', 'Bijnor', 'Badaun', 'Bulandshahr', 'Chandauli',
    'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad',
    'Fatehpur', 'Firozabad', 'Gautam Buddh Nagar', 'Ghaziabad', 'Ghazipur',
    'Gonda', 'Gorakhpur', 'Hamirpur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur',
    'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
    'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba',
    'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar',
    'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
    'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar',
    'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ];
    sortedDistricts: string[] = [...this.allDistricts];
 
  showStripeModal = false;

  stripe!: Stripe | null;
  card!: StripeCardElement;
  cardErrors: string = '';
  elements!: StripeElements;

  async ngAfterViewInit() {
    this.stripe = await loadStripe('pk_test_51RRWZeQfs77aMeK5diOhKL5RasIkVCsWwYzCnA9cvCi06WTBO8ncCh6adeTAdlqst7XVrvCBm3CQ01tSTFrYBWLu00EkFB1owQ');

    // Wait for DOM and modal to be visible
    const interval = setInterval(() => {
      const cardElement = document.getElementById('card-element');
      if (cardElement && this.stripe) {
        clearInterval(interval);
        this.mountCardElement();
      }
    }, 100);
  }

  mountCardElement() {
    this.elements = this.stripe!.elements();

    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };

    this.card = this.elements.create('card', { style });
    this.card.mount('#card-element');
  }



  constructor(private roomService: RoomService, private http: HttpClient,
    private feedbackService: FeedbackService,
    private mapService: LeafletMapService,
    private hotelierService: AuthPortalService,
    private hotelsService: HotelsService,
    private router: Router,
    private Aroute: ActivatedRoute,
    private authService:AuthService,
    private elementRef: ElementRef,
    private stripeService:StripeService
  ) {

    this.Aroute.queryParams.subscribe(params => {
      this.username = params['username'];
      this.UserFullname = params['fullname'];
      this.password = params['password'];
      this.phonenumber = params['phonenumber'];

      console.log('Username:', this.username);
      console.log('Full name:', this.UserFullname);
      console.log('Password:', this.password);
      console.log('Phone:', this.phonenumber);

    
  });

  

  }


 @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
    this.destroy();
    this.destroyStripeElements();
      if (this.card) {
      this.card.destroy();
    }
  }

   async setupStripe() {
    this.stripe = await loadStripe('pk_test_51RRWZeQfs77aMeK5diOhKL5RasIkVCsWwYzCnA9cvCi06WTBO8ncCh6adeTAdlqst7XVrvCBm3CQ01tSTFrYBWLu00EkFB1owQ'); // replace with your Stripe publishable key

    if (!this.stripe) {
      console.error('Stripe failed to load');
      return;
    }

    const elements = this.stripe.elements();

    this.card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#a0aec0',
          },
        },
      },
    });

    this.card.mount('#card-element');

   this.card.on('change', (event) => {
  if (event.error) {
    this.cardErrors = event.error.message;   // just update the string
  } else {
    this.cardErrors = '';
  }
});
  }

openStripeModal() {
  this.showStripeModal = true;

  // Use requestAnimationFrame + setTimeout to wait for DOM to render
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (!this.stripe) return;

      const elements = this.stripe.elements();

      // Avoid remounting if already mounted
      if (!this.card) {
        this.card = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              '::placeholder': {
                color: '#a0aec0',
              },
            },
          },
        });

        this.card.mount('#card-element');

        this.card.on('change', (event) => {
          this.cardErrors = event.error ? event.error.message : '';
        });
      }
    }, 0);
  });
}


  closeStripeModal() {
    this.showStripeModal = false;
    this.cardErrors = '';

    if (this.card) {
      this.card.destroy();
      // Reset card element to undefined so it can be created fresh next open
      this.card = undefined!;
      // Alternatively: this.card = null as well
    }
  }

async payWithCard() {
  // ✅ Step 1: Validate your form before proceeding
  if (!this.atLeastOneAmenitySelected) {
    alert('Please select at least one amenity.');
    return;
  }

  if (!this.atLeastOnePropertyType) {
    alert('Please select the type of property.');
    return;
  }

  const form = this.propertyNgForm;
  if (!form.valid) {
    alert('Please fill all required fields correctly.');
    return;
  }

  if (this.imageFiles.length === 0) {
    alert('Please upload at least one image.');
    return;
  }

  this.isLoading = true;

  try {
    const { clientSecret } = await this.createPaymentIntentOnBackend();

    if (!this.stripe || !this.card) {
      alert('Stripe.js has not loaded properly.');
      this.isLoading = false;
      return;
    }

    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.card,
      }
    });

    if (result.error) {
      this.cardErrors = result.error.message || 'Payment failed.';
      this.isLoading = false;
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      alert('Payment successful!');
      this.closeStripeModal();

      // ✅ Payment succeeded, now run the main hotel registration logic
      this.log();
    }
  } catch (error) {
    console.error(error);
    alert('Payment process failed. Please try again.');
  }

  this.isLoading = false;
}

  // Dummy method, replace with your real backend call
async createPaymentIntentOnBackend(): Promise<{ clientSecret: string }> {
  const response = await fetch('https://staysearchbackend.onrender.com/api/payment/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 9900 })
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent on backend');
  }

  const res = await response.json();

  if (!res || !res.clientSecret) {
    throw new Error('Missing clientSecret in backend response');
  }

  return res;
}


  destroyStripeElements() {
    if (this.card) {
      this.card.unmount();
      // this.card = null;
    }
  }


   
formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

   async ngOnInit() {
     this.stripe = await loadStripe('pk_test_51RRWZeQfs77aMeK5diOhKL5RasIkVCsWwYzCnA9cvCi06WTBO8ncCh6adeTAdlqst7XVrvCBm3CQ01tSTFrYBWLu00EkFB1owQ');

    this.checkHotelsData();
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
  
 this.minDateTime = this.formatDateTimeLocal(new Date());
  this.maxDateTime = this.formatDateTimeLocal(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));

    if (this.stripe) {
      const elements = this.stripe.elements();
      this.card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
              color: '#a0aec0',
            },
          },
          invalid: {
            color: '#e53e3e',
          },
        },
      });
      this.card.mount('#card-element');

      this.card.on('change', (event) => {
        if (event.error) {
          this.cardErrors = event.error.message ?? '';
        } else {
          this.cardErrors = '';
        }
      });
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
    this.feedbackService.getFeedback().subscribe({
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

  //replying to feedback
  showReplyModal = false;
  selectedFeedback: any = null;
  replyText = '';
  
  openReplyModal(feedback: any) {
    this.selectedFeedback = feedback;
    this.replyText = '';
    this.showReplyModal = true;
  }
  
  closeReplyModal() {
    this.showReplyModal = false;
  }
  
  sendReply() {
    console.log('Replying to:', this.selectedFeedback);
    console.log('Message:', this.replyText);
    this.closeReplyModal();
    // You can call a service here to send the reply to backend
  }


  /*deleteFeedback(id: number) {
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
  }*/
  
  


  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectMenu(menu: string) {
    this.isDeal =false;
    
      if (this.selectedMenu === 'hotels' && menu !== 'hotels') {
        this.mapService.destroyMap();
      }

      this.selectedMenu = menu;
    
      if (menu === 'rooms') {
        this.loadRoomsByHotel(this.currentHotelId);
      }

      if (menu === 'dashboard') {
        this.checkHotelsData();
      }
      if (menu === 'deal') {
        this.isDeal = true;
         this.loadRoomsByHotel(this.currentHotelId);
      }
    
      if (menu === 'hotels') {
        setTimeout(() => {
          const container = document.getElementById('map');
          if (container) {
            this.mapService.initializeMap('map', [28.6139, 77.2090]);
            this.mapService.onMarkerDrag((latlng) => {
              this.latitude = latlng.lat;
              this.longitude = latlng.lng;
            });
    
            setTimeout(() => this.mapService.invalidateSize(), 300);
          }
        }, 200);
           if(this.username){
            console.log(" No  profile needed");
           }
           else{
            this.getUserProfile();
           }

      }
    
    if (menu === 'profile') {
       if(this.username){
            console.log(" No  profile needed");
           }
           else{
            this.getUserProfile();
           }

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
      cancelButtonText: 'Stay',
    
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        this.router.navigate(['/adminAccess']);
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
  
      this.http.post<Room>(`http://localhost:8080/api/hotels/${this.currentHotelId}/rooms`, formData)
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
  this.newRoom.imageUrl = "";

  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.newRoom.imageUrl = reader.result as string; // Data URL
      //  console.log("img url ", this.newRoom.imageUrl);
    };
    reader.readAsDataURL(this.selectedFile);
    
 
  }
  

}


  addRoom() {
    
  
    if (this.newRoom.name && this.newRoom.available >= 0 && this.newRoom.total > 0 && this.newRoom.price > 0 && this.selectedFile) {
         this.isLoading = true;
      // const formData = new FormData();
      // formData.append('room', new Blob([JSON.stringify(this.newRoom)], { type: 'application/json' }));
      //  formData.append('imageUrl', this.selectedFile);
      // formData.append('hotelId', this.currentHotelId.toString());
      // formData.append('name', this.newRoom.name);
      // formData.append('total', this.newRoom.total.toString());
      // formData.append('available', this.newRoom.available.toString());
      // formData.append('price', this.newRoom.price.toString());
      //  formData.append('description', this.newRoom.description ?? '');
  
      //  const payload = {
      //   hotelId: this.currentHotelId,
      //   name: this.newRoom.name,
      //   total: this.newRoom.total,
      //   available: this.newRoom.available,
      //   price: this.newRoom.price,
      //   description: this.newRoom.description,
      //   imageUrl: "fnirnngierng",
      //   deal:this.newRoom.deal,
      //   type: "Suite"
      //  }

      const formData = new FormData();
       formData.append("file", this.selectedFile);
    
      formData.append("room", JSON.stringify({
        hotelId: this.currentHotelId,
        name: this.newRoom.name,
        total: this.newRoom.total,
        available: this.newRoom.available,
        price: this.newRoom.price,
        description: this.newRoom.description,
        imageUrl: this.newRoom.imageUrl,
        deal: this.newRoom.deal,
        type: "Suite"
      }));

      this.roomService.addRoom(formData).subscribe({
        next: (addedRoom: Room) => {
          this.rooms.push(addedRoom);
          if(this.newRoom.deal){
            
            this.selectedMenu = 'deal';
           }
          this.newRoom = { name: '', available: 0, total: 0, price: 0, deal: false, imageUrl: '' };
          this.selectedFile = null!;
          this.showAddRoomForm = false;
          console.log(this.newRoom.deal);
          this.isLoading = false;
          alert('Room added successfully!');
          this.loadRoomsByHotel(this.currentHotelId);
          
          this.updateStats();
        },
        error: (err: any) => {
          this.isLoading = false;
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
        this.isLoading = true;
        this.roomService.deleteRoom(roomId).subscribe({
          next: () => {
            this.rooms = this.rooms.filter(r => r.id !== roomId);
            this.isLoading = false;
            Swal.fire('Deleted!', 'The room has been deleted.', 'success');
          },
          error: (err) => {
            this.isLoading = false;
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
        this.isLoading = true;
        // Create a FormData object
        const formData = new FormData();
  
        // Append room data to FormData
       formData.append('hotelId', this.currentHotelId.toString());
       formData.append('id', this.newRoom.id?.toString() || '');
       formData.append('name', this.newRoom.name);
       formData.append('available', this.newRoom.available.toString());
       formData.append('total', this.newRoom.total.toString());
       formData.append('price', this.newRoom.price.toString());
       formData.append('deal', this.newRoom.deal ? 'true' : 'false');
       formData.append('description', this.newRoom.description || '');
       formData.append('showFullDesc', this.newRoom.showFullDesc ? 'true' : 'false');
  
  
        // Send FormData as multipart/form-data
       this.roomService.updateRoom(this.newRoom.id, formData).subscribe({
        next: (updatedRoom: Room) => {
          
          if (this.editIndex !== null) {
            this.rooms[this.editIndex] = updatedRoom;
          }
  
          // Now update the image separately if needed
          if (this.selectedFile) {
            const imageData = new FormData();
            imageData.append('imageUrl', this.selectedFile, this.selectedFile.name);
  
            this.roomService.updateRoomImage(this.newRoom.id!, imageData).subscribe({
              next: () => {
                Swal.fire('Success', 'Room and image updated successfully!', 'success');
                this.updateStats();
                this.resetRoomForm();
                this.loadRoomsByHotel(this.currentHotelId);
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Image update failed:', err);
                Swal.fire('Warning', 'Room updated, but image update failed.', 'warning');
                this.updateStats();
                this.resetRoomForm();
                this.isLoading = false;
              }
            });
          } else {
            Swal.fire('Success', 'Room updated successfully!', 'success');
            this.updateStats();
            this.resetRoomForm();
            this.loadRoomsByHotel(this.currentHotelId);
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', 'Failed to update room.', 'error');
          this.isLoading = false;
        },
         });
        } else {
         alert('Please fill all fields!');
        }

  
     // add offer section
   if(this.isDeal){
      if(this.discountInfo.description >0 && this.discountInfo.validFrom && this.discountInfo.validTill)
      {
 
       this.discountInfo.image  =  this.rooms[this.editIndex? this.editIndex:0].imageUrl || "";
       
       this.discountInfo.title = this.currentHotelName;


      console.log(this.discountInfo.description);
       console.log(this.discountInfo.validFrom);
      console.log(this.discountInfo.validTill);
       console.log(this.discountInfo.title);
       console.log(this.discountInfo.image);

      const newOffer =
       {
      title: this.discountInfo.title,
      description:this.discountInfo.description.toString(),
      badge: this.discountInfo.badge,
      image: this.discountInfo.image,
       validFrom:this.discountInfo.validFrom,
        validTill:this.discountInfo.validTill,
       status: "PENDING"

        }

      this.hotelsService.createOffer(newOffer).subscribe({
      next: response => {
        console.log('Offer created:', response);
           this.discountInfo.title="";
           this.discountInfo.description=0;
           this.discountInfo.image="",
           this.discountInfo.validFrom="",
           this.discountInfo.validTill=""
           alert("Offer creation successfull awaiting approval")

          },
         error: err => {
        console.error('Error creating offer:', err);
          }
         });


    
      }

       else{
     alert("Please Fill offer details(Date,Time and discount ) correctly to create offer ")
      }

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
    
    this.roomService.getRooms().subscribe((data: Room[]) => {
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


  editHotel(hotel: any): void {
    this.isEditModalOpen = true;
    // Example: Navigate or open modal with hotel data
    console.log('Editing:', hotel);
    // You can integrate this with a modal, a form section, or routing logic.
  }


  onAmenityChange(event: any) {
    this.amenitiesTouched = true;
    const value = event.target.value;
    const checked = event.target.checked;
  
    if (checked) {
      this.selectedAmenities.push(value);
    } else {
      this.selectedAmenities = this.selectedAmenities.filter(a => a !== value);
    }
  
    this.atLeastOneAmenitySelected = this.selectedAmenities.length > 0;
  }

  onPropertyChange(event: any) {
    this.propertyTypeTouched = true;
    this.selectedProperty = event.target.value;
    
    // If a value is selected, set `atLeastOnePropertyType` to true.
    this.atLeastOnePropertyType = !!this.selectedProperty;
  }

  // log() {
  //   if (!this.atLeastOneAmenitySelected) {
  //     alert('Please select at least one amenity.');
  //     return;
  //   }
  
  //   if (!this.atLeastOnePropertyType) {
  //     alert('Please select the type of property.');
  //     return;
  //   }
  
  //   const form = this.propertyNgForm;
  
  //   if (!form.valid) {
  //     alert('Please fill all required fields correctly.');
  //     return;
  //   }
  
  //   if (this.imageFiles.length === 0) {
  //     alert('Please upload at least one image.');
  //     return;
  //   }
  //   this.isLoading = true;
  //   // Build property/hotel data
  //   const propertyData = {
  //     name: form.value.propertyName,
  //     address: form.value.propertyAddress,
  //     destination: form.value.district,
  //     description: form.value.longDescription,
  //     amenities: this.selectedAmenities,
  //     lat: this.latitude,
  //     lng: this.longitude,
  //     accommodationType: this.selectedProperty,
  //     rating: 4.8,
  //     price: form.value.price,
  //     reviews: "Amazing stay!",
  //     liked: true,
  //     checkIn: form.value.checkIn,
  //     checkOut: form.value.checkOut,
  //     guests: form.value.guests,
  //     rooms: form.value.rooms
  //   };
  
  //   // Create FormData for file and data upload
  //   const formData = new FormData();
  //   formData.append(
  //     "hotel",
  //     new Blob([JSON.stringify(propertyData)], {
  //       type: "application/json",
  //     })
  //   );
  
  //   // First image = cover
  //   formData.append("imageUrl", this.imageFiles[0]);
  
  //   // Remaining images = subImages
  //   for (let i = 1; i < this.imageFiles.length; i++) {
  //     formData.append("subImages", this.imageFiles[i]);
  //   }

  //   console.log('Appending subImages:');


  //   for (let [key, value] of formData.entries()) {
  //     console.log('FormData Entry:', key, value);
  //   }
  
  //   // Submit via service
  //   this.hotelierService.registerHotel(formData).subscribe({
  //     next: (res: any) => {
  //       // alert('Hotel registration success. Awaiting admin approval.');
  //       this.selectedMenu = 'rooms';
  //       this.imagePreviews = [];
  //       this.imageFiles = [];
  //       this.subImages = [];

      
  //       // Clear Individual Previews (if used)
  //         this.roomImagePreview = '';
  //          this.poolImagePreview = '';
  //           this.lobbyImagePreview = '';
  //           this.isLoading = false;

  //     },
  //     error: (err: any) => {
  //       this.isLoading = false;
  //       alert('Registration failed. Try again later.');
  //       console.error(err);
  //     }
  //   });
  // }


  log() {
    if (!this.atLeastOneAmenitySelected) {
      alert('Please select at least one amenity.');
      return;
    }
  
    if (!this.atLeastOnePropertyType) {
      alert('Please select the type of property.');
      return;
    }
  
    const form = this.propertyNgForm;
  
    if (!form.valid) {
      alert('Please fill all required fields correctly.');
      return;
    }
  
    if (this.imageFiles.length === 0) {
      alert('Please upload at least one image.');
      return;
    }
  
    const propertyData = {
      name: form.value.propertyName,
      address: form.value.propertyAddress,
      destination: this.selectedDistrict,
      description: form.value.longDescription,
      amenities: this.selectedAmenities,
      lat: this.latitude,
      lng: this.longitude,
      accommodationType: this.selectedProperty,
      rating: 4.8,
      price: form.value.propertyPrice,
      reviews: "",
      liked: false,
      checkIn: form.value.checkIn,
      checkOut: form.value.checkOut,
      guests: form.value.guests,
      rooms: form.value.rooms
    };
  
    const formData = new FormData();
    formData.append("hotel", new Blob([JSON.stringify(propertyData)], { type: "application/json" }));
    formData.append("imageUrl", this.imageFiles[0]);
    for (let i = 1; i < this.imageFiles.length; i++) {
      formData.append("subImages", this.imageFiles[i]);
    }
  
    const token = localStorage.getItem('token');
  
    if (token) {
      // ✅ User already logged in → directly register hotel
      this.registerHotelafterLogin(formData);
    } else {
      // 🔐 No token → register user → login → then register hotel
      this.isLoading = true;
  
      const userData = {
        fullname: this.UserFullname,
        username: this.username,
        password: this.password,
        phonenumber: this.phonenumber
      };
  this.isLoading = true;
      this.hotelierService.registerHotelier(userData).subscribe({
        next: () => {
          const loginPayload = {
            username: this.username,
            password: this.password
          };
  
          this.authService.loginHot(loginPayload).subscribe({
            next: (res: any) => {
              this.isLoading = true;
              if (res.token) {
                localStorage.setItem('token', res.token);
                this.registerHotel(formData);
              } else {
                this.isLoading = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Login Failed',
                  text: 'Login failed. Please try again.'
                });
                this.isLoading = false;
              }
            },
            error: (err: any) => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err?.error?.message || 'Invalid credentials.'
              });
              console.error('Login error:', err);
            }
          });
        },
        error: (err: any) => {
          this.isLoading = false;
          alert('User registration failed.');
          console.error(err);
        }
      });
    }
  }

  registerHotel(formData: FormData) {
    this.isLoading = true;
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        alert("Registration successful. Awaiting for admin approval");
        this.selectedMenu = 'rooms';
        this.imagePreviews = [];
        this.imageFiles = [];
        this.subImages = [];
        localStorage.removeItem("token");
        this.router.navigate(['adminAccess']);
        this.roomImagePreview = '';
        this.poolImagePreview = '';
        this.lobbyImagePreview = '';
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        alert('Hotel registration failed.');
        console.error(err);
      }
    });
  }

  registerHotelafterLogin(formData: FormData) {
    this.isLoading = true;
    this.hotelierService.registerHotel(formData).subscribe({
      next: () => {
        alert("Registration successful.");
        this.selectedMenu = 'rooms';
        this.imagePreviews = [];
        this.imageFiles = [];
        this.subImages = [];
        this.roomImagePreview = '';
        this.poolImagePreview = '';
        this.lobbyImagePreview = '';
        this.isLoading = false;
         this.checkHotelsData();
         this.selectedMenu = 'dashboard';
      },
      error: (err: any) => {
        this.isLoading = false;
        alert('Hotel registration failed.');
        console.error(err);
      }
    });
  }
  


  
previewImages(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    files.forEach((file, i) => {
      this.imageFiles.push(file); // Add all files
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.subImages.push(e.target.result); // Push preview
      };
      reader.readAsDataURL(file);
    });
  }
}





   previewRoomImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.roomImagePreview = e.target.result;
        if (this.roomImagePreview) {
          this.subImages[1] = this.roomImagePreview;
          this.imageFiles[1] = file;
          // Store the image in subImages array
        }
      };
      reader.readAsDataURL(file); // Convert file to base64 string for preview
    }
   }
 
   // Handle Pool Image preview and save URL
   previewPoolImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.poolImagePreview = e.target.result;
        if (this.poolImagePreview) {
          this.subImages[2] = this.poolImagePreview; // Store the image in subImages array
          this.imageFiles[2] = file;
        }
      };
      reader.readAsDataURL(file);
    }
   }

   // Handle Lobby Image preview and save URL
   previewLobbyImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.lobbyImagePreview = e.target.result;
        if (this.lobbyImagePreview) {
          this.subImages[3] = this.lobbyImagePreview; // Store the image in subImages array
          this.imageFiles[3] = file;
          // console.log(this.subImages);
        }
      };
      reader.readAsDataURL(file);
    }
  }


  // add proprty button on dashboard
  addNewProperty(){
    this.selectMenu('hotels');
    this.selectedMenu = 'hotels'
  }


  searchQuery = '';
  suggestions: any[] = [];
  
  onSearchChange() {
    if (this.searchQuery.length < 3) {
      this.suggestions = [];
      return;
    }
  
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        this.suggestions = data;
      });
  }
  
  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.display_name;
    this.suggestions = [];
  
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
  
    this.mapService.setMarker([lat, lon]);
    const map = this.mapService.getMap();
    if (map) {
      map.setView([lat, lon], 15);
    }
  
    this.latitude = lat;
    this.longitude = lon;
  }
  
// for updatedit 
closeEditModal() {
  this.isEditModalOpen = false;
}

saveHotel() {
  // TODO: Send `editHotel` data to backend or update in list
  console.log('Saved hotel:', this.editHotel);
  this.closeEditModal();
}

//  checkHotelsData(){
//   this.isLoading= true;
//   this.hotelsService.getHotels().subscribe({
//     next: (data) => {
//       if (!data || data.length === 0) {
//         this.showmenu = false;
//         console.log('No hotels found');
//         this.addNewProperty();
//         this.isLoading = false;
        
//         // Optional: handle empty state in UI
//       } else {
        
//         this.hotels = data.map((hotel: any) => ({
//           name: hotel.name || 'Unnamed Hotel',
//           location: hotel.address || 'Unknown Location',
//           rating: hotel.rating || 0,
//           amenities: hotel.amenities || [],
//            id:hotel.hotelId || 0
//         }));
//         this.currentHotelId = this.hotels[0].id;
//         this.isLoading = false;

//         // console.log('Mapped Hotels:', this.hotels);
//       }
//     },
//     error: (err) => {
//       this.isLoading = false;
//       console.error('Error fetching hotels:', err.message);
//       // Optional: show error to user
//     }
//   });
// }

checkHotelsData() {
  this.isLoading = true;

  // Check if token exists in localStorage
  const token = localStorage.getItem('token'); // or sessionStorage, depending on where you store it

  if (!token) {
    // If no token found, hide all sections except the hotel section
    this.showmenu = false; // Hide other sections
    this.isLoading = false;
    this.addNewProperty();
    console.log('No token found, showing hotel section only.');

    // You can also display a message or redirect the user if needed
    return; // Do not proceed with fetching hotels
  }

  // If token is found, show the full menu
  this.showmenu = true;

  // Now call the service to fetch hotels
  this.hotelsService.getHotels().subscribe({
    next: (data) => {
      if (!data || data.length === 0) {
        console.log('No hotels found');
        this.addNewProperty(); // Call your method to add a new property if needed
        this.isLoading = false;
        
      } else {
        this.hotels = data.map((hotel: any) => ({
          name: hotel.name || 'Unnamed Hotel',
          location: hotel.address || 'Unknown Location',
          rating: hotel.rating || 0,
          amenities: hotel.amenities || [],
          id: hotel.hotelId || 0
        }));
        this.currentHotelId = this.hotels[0].id;
        this.isLoading = false;
        this.currentHotelName =this.hotels[0].name;
      }
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Error fetching hotels:', err.message);
    }
  });
}



onHotelSelect(event: Event, hotelId: number) {
  const checked = (event.target as HTMLInputElement).checked;
  
  if (checked) {
    this.currentHotelId = hotelId; 
    this.fetchHotelById(hotelId); 
    //  Load specific hotel rooms
  } else {
    this.currentHotelId = 0;
    this.rooms = []; // 👈 Clear rooms when deselected
  }
}


loadRoomsByHotel(hotelId: number) {
  this.isLoading = true; // Show loading spinner or indicator
  this.roomService.getRoomsByHotelId(hotelId).subscribe({
    next: (rooms: Room[] | null) => {
      if (!rooms || rooms.length === 0) {
        this.rooms = []; // ✅ Clear rooms on empty response
        this.roomStatus = { available: 0, occupied: 0 }; // Optional stat reset
        this.isLoading = false;
        return;
      }
      this.isLoading = false; // Hide loading spinner or indicator
      this.rooms = rooms.map(room => ({
        ...room,
        showFullDesc: false
      }));
      this.updateStats();
      this.isLoading = false; // Hide loading spinner or indicator
    },
    error: (err) => {
      console.error('Failed to fetch rooms:', err);
      this.isLoading = false; // Hide loading spinner or indicator
    }
  });
}



fetchHotelById(hotelId: number) {
  this.isLoading = true; // Show loading spinner or indicator
  this.hotelierService.getHotelById(hotelId).subscribe(
    (response: any) => {
      // Store the fetched hotel data
      this.selectedHotel = response;
      console.log(this.selectedHotel);
      this.isLoading = false; // Hide loading spinner or indicator
      alert("You are Viewing/Making changes to: "+this.selectedHotel.name);
      this.currentHotelName = this.selectedHotel.name;
    },
    (error) => {
      console.error('Error fetching hotel:', error);
      this.isLoading = false;
    }
  );
}

getFilteredMenuItems() {
  if (!this.showmenu) {
    return this.menuItems.filter(item => item.key === 'hotels');
  }
  return this.menuItems;
}


updatePassword() {
   this.isLoading = true;
    console.log('Updating password with:', {
      oldPassword: this.userprofile.password,
      newPassword: this.userprofile.newPassword
    });
  
  
    if (this.userprofile.password && this.userprofile.newPassword) {
      this.authService.updatePassword(this.userprofile.password, this.userprofile.newPassword).subscribe({
        next: (res) => {
          Swal.fire({ text: res.message, icon: 'success' });
          this.userprofile.password = '';
         this.userprofile.newPassword = '';
           this.isLoading = false;
         },
         error: (err) => {
           let errorMessage = 'Failed to update password.';
  
         if (typeof err.error === 'string') {
             errorMessage = err.error;
           } else if (err.error?.message) {
            errorMessage = err.error.message;
           }
  
          Swal.fire({ text: errorMessage, icon: 'error' });
           this.isLoading = false;
        }
       });
    } else {
      Swal.fire({ text: 'Please fill in both password fields.', icon: 'warning' });
      this.isLoading = false;
    }



  }
  
  updateProfile() {
    this.isLoading = true;
    console.log('Updating profile with:', {
      fullName: this.userprofile.fullName,
      contact: this.userprofile.contact
    });
   const payload ={
    fullname: this.userprofile.fullName,
    phonenumber: this.userprofile.contact
   }

       this.authService.updateUserProfile(payload).subscribe({
          next: (response) => {
            console.log('Profile updated successfully:', response);
            Swal.fire({
              title: 'Success',
              text: 'Profile updated successfully',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.isLoading = false
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to update profile',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            this.isLoading = false
          }
        });
      
   
  }

  onSubmit() {
    console.log('Updating password with:', this.userprofile);
    alert('Password updated successfully!');
  }



  onDiscountInput(event: any): void {
    const input = event.target;
    let value = parseInt(input.value, 10);
  
    if (value > 100) {
      input.value = '100';
    } else if (value < 1 && input.value !== '') {
      input.value = '1';
    }
  }
 toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.searchText = ''; // Reset search text
      this.sortedDistricts = [...this.allDistricts]; // Reset list
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownPanel = document.querySelector('.dropdown-panel');
    const triggerBox = document.querySelector('.dropdown-trigger');
    
    // Close dropdown if the click is outside of the dropdown and the trigger
    if (dropdownPanel && !dropdownPanel.contains(target) && !triggerBox?.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  // Filter districts based on the search text
  sortDistricts() {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      this.sortedDistricts = [...this.allDistricts];
      return;
    }

    const matches = [];
    const nonMatches = [];

    // Separate matching and non-matching districts
    for (const district of this.allDistricts) {
      if (district.toLowerCase().includes(query)) {
        matches.push(district);
      } else {
        nonMatches.push(district);
      }
    }

    this.sortedDistricts = [...matches, ...nonMatches];
  }

  // Select a district
  selectDistrict(district: string) {
    this.selectedDistrict = district;
    this.dropdownOpen = false;
    console.log('Selected district:', this.selectedDistrict);
  }


getUserProfile()
{
   this.authService.getUserProfile().subscribe({
        next: (data) => {
      this.userprofile.email=this.username = data.email;
         this.userprofile.contact= this.phonenumber = data.phoneNumber;
         this.userprofile.fullName = data.fullName;
         },
        error: (err) => {
         console.error('Error fetching users:', err);
             }
            });

}
  
}
