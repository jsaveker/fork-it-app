import { searchNearbyRestaurants } from '../googlePlacesApi';

const filters = { minRating: 0, maxDistance: 1000, minPrice: 1, maxPrice: 4 };

describe('searchNearbyRestaurants', () => {
  it('returns restaurants within the radius and price range', async () => {
    const results = await searchNearbyRestaurants({
      latitude: 37.794,
      longitude: -122.395,
      radius: 1000,
      filters
    });
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      expect(r.price_level).toBeGreaterThanOrEqual(filters.minPrice);
      expect(r.price_level).toBeLessThanOrEqual(filters.maxPrice);
    });
  });
});
