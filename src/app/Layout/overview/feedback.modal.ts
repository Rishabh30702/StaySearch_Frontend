export interface Feedback {
  id?: number;
  description: string;
  likedAmenities: string[];
  rating: number;
  hotelName: string;
  createdAt?: string;
  user?: {
    id: number;
    username: string;
    fullname: string;
    role: string;
  };
  expanded?: boolean;
}
