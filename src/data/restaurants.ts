import { Restaurant } from '../types/Restaurant';

export const restaurants: Restaurant[] = [
  {
    id: 'sf1',
    name: 'Golden Gate Grill',
    vicinity: '123 Market St, San Francisco, CA',
    rating: 4.5,
    user_ratings_total: 120,
    price_level: 2,
    geometry: { location: { lat: 37.794, lng: -122.395 } },
    types: ['restaurant', 'american']
  },
  {
    id: 'sf2',
    name: 'Bay City Sushi',
    vicinity: '456 Embarcadero, San Francisco, CA',
    rating: 4.2,
    user_ratings_total: 80,
    price_level: 2,
    geometry: { location: { lat: 37.798, lng: -122.398 } },
    types: ['restaurant', 'sushi']
  },
  {
    id: 'sf3',
    name: 'Mission Tacos',
    vicinity: '789 Mission St, San Francisco, CA',
    rating: 4.0,
    user_ratings_total: 150,
    price_level: 1,
    geometry: { location: { lat: 37.784, lng: -122.407 } },
    types: ['restaurant', 'mexican']
  },
  {
    id: 'sf4',
    name: 'Central Pizza',
    vicinity: '321 3rd St, San Francisco, CA',
    rating: 3.8,
    user_ratings_total: 60,
    price_level: 1,
    geometry: { location: { lat: 37.781, lng: -122.399 } },
    types: ['restaurant', 'pizza']
  },
  {
    id: 'sf5',
    name: 'Downtown Deli',
    vicinity: '654 Howard St, San Francisco, CA',
    rating: 4.3,
    user_ratings_total: 40,
    price_level: 1,
    geometry: { location: { lat: 37.786, lng: -122.401 } },
    types: ['restaurant', 'deli']
  }
];
