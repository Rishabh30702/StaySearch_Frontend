export interface HotelRegistration {
    id: number;
    hotelName: string;
    ownerName: string;
    address: string;
    email: string;
    phone: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    documents: string[]; // or File references
    createdAt: Date;
  }