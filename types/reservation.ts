export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Reservation {
  id: number;
  productId: number;
  businessId?: number;
  outletId?: number;
  userId: number;
  quantity: number;
  status: ReservationStatus | string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  pickedUpAt?: string | null;
  cancelledAt?: string | null;
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    discountedPrice?: number;
    imageUrl?: string;
    business?: {
      id: number;
      name: string;
      address: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
    };
  };
}

export interface CreateReservationInput {
  productId: number;
  businessId: number;
  quantity: number;
}

export interface ReservationFilters {
  status?: ReservationStatus;
  productId?: number;
  businessId?: number;
}

export interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: number) => void;
  onViewDetails?: (reservation: Reservation) => void;
  showActions?: boolean;
}
