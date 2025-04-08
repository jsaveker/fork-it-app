export interface Restaurant {
  id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  price_level: number;
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface FilterOptions {
  minRating: number;
  maxDistance: number;
  minPrice: number;
  maxPrice: number;
}

export interface RestaurantVote {
  restaurantId: string;
  upvotes: string[];
  downvotes: string[];
}

export interface GroupSession {
  id: string;
  name: string;
  restaurants: Restaurant[];
  votes: RestaurantVote[];
  createdAt: string;
  expires: number;
  filters?: FilterOptions;
} 