// Category interface
export interface Category {
  id: number;
  name: string;
}

// Business info interface
export interface BusinessInfo {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  description?: string;
}

export interface Product {
  id: number;
  businessId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  imageUrl?: string;
  status: string;
  business?: BusinessInfo;
  distance?: number; // Distance in kilometers
}