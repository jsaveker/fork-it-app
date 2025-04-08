import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Typography, Paper } from '@mui/material'
import { RestaurantCard } from './RestaurantCard'
import { useLocation } from '../contexts/LocationContext'
import { useVoting } from '../hooks/useVoting'
import { searchNearbyRestaurants } from '../services/googlePlacesApi'
import { Restaurant } from '../types/Restaurant'
import { useFilters } from '../hooks/useFilters'
import { useSession } from '../hooks/useSession'
import { useDebounce } from '../hooks/useDebounce'
import { Loader2 } from 'lucide-react'
import { AddressInput } from './AddressInput'

export const RestaurantFinder = () => {
  const { location, error: locationError } = useLocation()
  const { session, createSession, getSessionUrl } = useSession()
  const { filters } = useFilters()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState(1500)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const lastFiltersRef = useRef(filters)
  const lastRadiusRef = useRef(radius)

  // Debounce the location and filters
  const debouncedLocation = useDebounce(location, 1000)
  const debouncedFilters = useDebounce(filters, 1000)
  const debouncedRadius = useDebounce(radius, 1000)

  const fetchRestaurants = useCallback(async () => {
    if (!debouncedLocation?.latitude || !debouncedLocation?.longitude) {
      console.log('No location available yet')
      return
    }

    // Check if location or filters have actually changed
    const locationChanged = 
      lastLocationRef.current?.lat !== debouncedLocation.latitude || 
      lastLocationRef.current?.lng !== debouncedLocation.longitude

    const filtersChanged = JSON.stringify(lastFiltersRef.current) !== JSON.stringify(debouncedFilters)
    const radiusChanged = lastRadiusRef.current !== debouncedRadius

    if (!locationChanged && !filtersChanged && !radiusChanged && !isInitialLoad) {
      console.log('Skipping fetch - no changes in location, filters, or radius')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching restaurants with location:', debouncedLocation)
      
      const results = await searchNearbyRestaurants({
        latitude: debouncedLocation.latitude,
        longitude: debouncedLocation.longitude,
        radius: debouncedRadius,
        filters: debouncedFilters
      })
      
      console.log('Received results:', results)
      setRestaurants(results)
      
      // Update refs with current values
      lastLocationRef.current = {
        lat: debouncedLocation.latitude,
        lng: debouncedLocation.longitude
      }
      lastFiltersRef.current = debouncedFilters
      lastRadiusRef.current = debouncedRadius
      setIsInitialLoad(false)
    } catch (err) {
      console.error('Error fetching restaurants:', err)
      setError('Failed to load restaurants. Please try again.')
    } finally {
      setLoading(false)
      setHasAttemptedLoad(true)
    }
  }, [debouncedLocation, debouncedFilters, debouncedRadius, isInitialLoad])

  // Effect to handle initial load and location/filter changes
  useEffect(() => {
    if (debouncedLocation && !hasAttemptedLoad) {
      fetchRestaurants()
    }
  }, [debouncedLocation, debouncedFilters, debouncedRadius, fetchRestaurants, hasAttemptedLoad])

  const handleStartNewSession = async () => {
    try {
      const newSession = await createSession()
      if (newSession) {
        // Update URL with new session ID
        const url = new URL(window.location.href)
        url.searchParams.set('session', newSession.id)
        window.history.pushState({}, '', url)
      }
    } catch (err) {
      console.error('Error creating new session:', err)
      setError('Failed to create new session')
    }
  }

  const handleShareSession = () => {
    const sessionUrl = getSessionUrl()
    if (sessionUrl) {
      navigator.clipboard.writeText(sessionUrl)
        .then(() => {
          // You might want to show a success message here
          console.log('Session URL copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy URL:', err)
          setError('Failed to copy session URL')
        })
    }
  }

  if (locationError) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography color="error">
          Error: {locationError}
        </Typography>
      </Paper>
    )
  }

  return (
    <div>
      <Paper sx={{ p: 2, m: 2 }}>
        {!session ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleStartNewSession}
            disabled={loading}
          >
            Start New Voting Session
          </Button>
        ) : (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleShareSession}
            disabled={loading}
          >
            Share Session
          </Button>
        )}
      </Paper>

      {error && (
        <Paper sx={{ p: 2, m: 2 }}>
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Paper sx={{ p: 2, m: 2 }}>
          <Typography>Loading restaurants...</Typography>
        </Paper>
      ) : restaurants.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '1rem' }}>
          {restaurants.map(restaurant => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant}
            />
          ))}
        </div>
      ) : hasAttemptedLoad ? (
        <Paper sx={{ p: 2, m: 2 }}>
          <Typography>No restaurants found. Try adjusting your filters or increasing the search radius.</Typography>
        </Paper>
      ) : null}
    </div>
  )
} 