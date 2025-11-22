// Tipos base
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  rating?: number;
  categories: Category[];
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  businessId: string;
  business?: Business;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  businessId: string;
  productId?: string;
  reservationDate: string;
  numberOfPeople: number;
  status: ReservationStatus;
  notes?: string;
  user?: User;
  business?: Business;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  businessId: string;
  rating: number;
  comment?: string;
  user?: User;
  business?: Business;
  createdAt: string;
  updatedAt: string;
}

export interface History {
  id: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: string;
  user?: User;
}

// Enums
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Input types para mutations
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateBusinessInput {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  categoryIds: string[];
  location?: CreateLocationInput;
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  categoryIds?: string[];
  location?: UpdateLocationInput;
}

export interface CreateLocationInput {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationInput {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  businessId: string;
  categoryIds: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryIds?: string[];
}

export interface CreateReservationInput {
  businessId: string;
  productId?: string;
  reservationDate: string;
  numberOfPeople: number;
  notes?: string;
}

export interface UpdateReservationInput {
  reservationDate?: string;
  numberOfPeople?: number;
  status?: ReservationStatus;
  notes?: string;
}

export interface CreateRatingInput {
  businessId: string;
  rating: number;
  comment?: string;
}

// Response types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query variables
export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface BusinessFiltersInput extends PaginationInput {
  categoryId?: string;
  city?: string;
  state?: string;
  minRating?: number;
  search?: string;
}

export interface ProductFiltersInput extends PaginationInput {
  businessId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}