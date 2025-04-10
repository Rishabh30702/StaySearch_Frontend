export interface Feedback {
  id: number;
  hotelName: string;
  likedAmenities: string[];
  rating: number;
  description: string;
  createdAt: string | Date;
  user?: {
    username: string;
    fullname:string;
  };
}