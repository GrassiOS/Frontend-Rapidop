export type RatingTargetType = 'business' | 'consumer';

export interface Rating {
  id: number;
  raterUserId: number;
  targetType: RatingTargetType;
  targetUserId: number;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratings: Rating[];
}

export interface RatingInput {
  score: number;
  comment?: string;
}

export interface RateBusinessInput extends RatingInput {
  businessId: number;
}

export interface RateConsumerInput extends RatingInput {
  consumerUserId: number;
}
