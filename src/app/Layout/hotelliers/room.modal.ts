export interface Room {
  id?: number;
  name: string;
  available: number;
  total: number;
  price: number;
  deal?: boolean;
  description?: string; // ✅ Marked as optional
  imageUrl?: string;
  showFullDesc?: boolean;
}
