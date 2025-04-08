import { useState, useEffect, useCallback } from 'react'
import { Button, Typography, Paper } from '@mui/material'
import { RestaurantCard } from './RestaurantCard'
import { useLocation } from '../contexts/LocationContext'
import { useVoting } from '../hooks/useVoting'
import { Restaurant } from '../types'
import { Loader2 } from 'lucide-react'
import { AddressInput } from './AddressInput'

const RestaurantFinder = () => {
  const { location, isLoading: isLocationLoading, error: locationError } = useLocation()
  const { session, isLoading: isSessionLoading, error: sessionError, createSession } = useVoting()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  // Create a session if one doesn't exist
  const ensureSession = useCallback(async () => {
    if (!session) {
      console.log('No session found, creating a new one')
      try {
        await createSession('New Session')
        return true
      } catch (err) {
        console.error('Failed to create session:', err)
        setError('Failed to create session')
        return false
      }
    }
    return true
  }, [session, createSession])

  // Fetch restaurants with proper dependency management
  const fetchRestaurants = useCallback(async () => {
    if (!location || isFetching) {
      return
    }

    setIsFetching(true)
    
    try {
      // Ensure we have a session
      const hasSession = await ensureSession()
      if (!hasSession) {
        setIsFetching(false)
        return
      }

      console.log('Location data:', {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address
      })

      // Validate location data
      if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        console.error('Invalid location data:', location)
        throw new Error('Invalid location coordinates')
      }

      // Log the exact request being made
      const requestBody = {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 1500,
        filters: {
          rating: 0,
          priceLevel: [1, 2, 3, 4],
          cuisineTypes: []
        }
      }
      console.log('Making API request with body:', requestBody)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/places/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch restaurants')
      }

      const data = await response.json()
      console.log('API Response:', {
        status: data.status,
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0] ? {
          id: data.results[0].id,
          name: data.results[0].name,
          vicinity: data.results[0].vicinity
        } : null
      })
      
      if (data.status === 'ZERO_RESULTS') {
        console.log('No restaurants found in the specified area')
        setRestaurants([])
        setError(null)
        setErrorDetails(null)
        return
      }
      
      setRestaurants(data.results || [])
      setError(null)
      setErrorDetails(null)
    } catch (err) {
      console.error('Error fetching restaurants:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (err instanceof Error && 'details' in err) {
        setErrorDetails((err as any).details)
      }
    } finally {
      setIsFetching(false)
    }
  }, [location, ensureSession, isFetching])

  // Only fetch restaurants when location changes
  useEffect(() => {
    if (location) {
      fetchRestaurants()
    }
  }, [location, fetchRestaurants])

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
    <div>
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Restaurants Near You
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {restaurants.length} restaurants found
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchRestaurants}
          disabled={isFetching}
          sx={{ mb: 2 }}
        >
          {isFetching ? 'Refreshing...' : 'Refresh Results'}
        </Button>
      </Paper>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  )
}

export default RestaurantFinder 