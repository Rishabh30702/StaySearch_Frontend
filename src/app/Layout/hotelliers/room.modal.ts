export interface Room {
    id?: number;
    name: string;
    available: number;
    description?: string;
    total: number;
    price: number;
    deal?: boolean;
    imageUrl?: string; // ✅ optional field for storing the image URL
  }
  