import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { RestaurantCard } from './RestaurantCard'
import { useLocation } from '../contexts/LocationContext'
import { useVoting } from '../hooks/useVoting'
import { Restaurant } from '../types'
import { Loader2 } from 'lucide-react'
import { AddressInput } from './AddressInput'

const RestaurantFinder = () => {
  const { location, isLoading: isLocationLoading, error: locationError } = useLocation()
  const { session, isLoading: isSessionLoading, error: sessionError } = useVoting()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!location || !session) return

      try {
        console.log('Fetching restaurants with params:', {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 1500
        })

        const response = await fetch(`${import.meta.env.VITE_API_URL}/places/nearby`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 1500,
            filters: {
              rating: 0,
              priceLevel: [1, 2, 3, 4],
              cuisineTypes: []
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          throw new Error(errorData.error || 'Failed to fetch restaurants')
        }

        const data = await response.json()
        console.log('Restaurants response:', data)
        setRestaurants(data.results || [])
        setError(null)
        setErrorDetails(null)
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        if (err instanceof Error && 'details' in err) {
          setErrorDetails((err as any).details)
        }
      }
    }

    fetchRestaurants()
  }, [location, session])

  if (isLocationLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{locationError}</p>
        <p className="mb-4">Please enter your address to find restaurants near you.</p>
        <AddressInput />
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{sessionError}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        {errorDetails && (
          <p className="text-gray-600 mb-4 text-sm">{errorDetails}</p>
        )}
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!restaurants.length) {
    return (
      <div className="text-center p-4">
        <p className="mb-4">No restaurants found in your area.</p>
        <AddressInput />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}

export default RestaurantFinder 