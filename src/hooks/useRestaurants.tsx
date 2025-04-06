import { createContext, useContext, useState, ReactNode } from 'react'
import { Restaurant, FilterOptions } from '../types'
import { useLocation } from './useLocation'
import { searchNearbyRestaurants } from '../services/placesApi'

interface RestaurantsContextType {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  selectedRestaurant: Restaurant | null;
  filters: FilterOptions;
  findRestaurants: (options?: Partial<FilterOptions>) => Promise<void>;
  getRandomRestaurant: () => Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
}

const defaultFilters: FilterOptions = {
  distance: 5, // miles
  rating: 0,
  priceLevel: [1, 2, 3, 4],
  cuisineTypes: [],
}

const RestaurantsContext = createContext<RestaurantsContextType | undefined>(undefined)

export const RestaurantsProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  
  const { location } = useLocation()

  const findRestaurants = async (options?: Partial<FilterOptions>) => {
    if (!location) {
      setError('Location is not available. Please enable location services.')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Combine current filters with any new options
      const currentFilters = { ...filters, ...(options || {}) }
      
      // Use the placesApi service to fetch restaurants
      const results = await searchNearbyRestaurants(
        location.latitude,
        location.longitude,
        currentFilters
      )
      
      setRestaurants(results)
      
      // Save filters state if options were provided
      if (options) {
        setFilters({...filters, ...options})
      }
      
    } catch (err) {
      setError('Failed to fetch restaurants. Please try again.')
      console.error('Error fetching restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRandomRestaurant = (): Restaurant | null => {
    if (restaurants.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * restaurants.length)
    const restaurant = restaurants[randomIndex]
    setSelectedRestaurant(restaurant)
    return restaurant
  }

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({...prev, ...newFilters}))
  }

  return (
    <RestaurantsContext.Provider 
      value={{ 
        restaurants, 
        loading, 
        error, 
        selectedRestaurant, 
        filters,
        findRestaurants,
        getRandomRestaurant,
        setSelectedRestaurant,
        updateFilters
      }}
    >
      {children}
    </RestaurantsContext.Provider>
  )
}

export const useRestaurants = (): RestaurantsContextType => {
  const context = useContext(RestaurantsContext)
  if (context === undefined) {
    throw new Error('useRestaurants must be used within a RestaurantsProvider')
  }
  return context
} 