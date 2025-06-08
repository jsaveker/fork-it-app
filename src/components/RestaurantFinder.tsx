import { devLog } from '../utils/logger';
import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Typography, Paper, Box } from '@mui/material'
import { RestaurantCard } from './RestaurantCard'
import { FilterButton } from './FilterButton'
import { useLocation } from '../contexts/LocationContext'
import { searchNearbyRestaurants } from '../services/googlePlacesApi'
import { Restaurant } from '../types/Restaurant'
import { useFilters } from '../hooks/useFilters'
import { useSession } from '../hooks/useSession'
import { ResultsChart } from './ResultsChart'
import CustomListCreator from './CustomListCreator'
import { useDebounce } from '../hooks/useDebounce'

export const RestaurantFinder = () => {
  const { location, error: locationError } = useLocation()
  const { session, createSession, getSessionUrl, isLoading: isSessionLoading } = useSession()
  const { filters } = useFilters()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radius] = useState(1500)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const lastFiltersRef = useRef(filters)
  const lastRadiusRef = useRef(radius)

  // Debounce the location and filters
  const debouncedLocation = useDebounce(location, 1000)
  const debouncedFilters = useDebounce(filters, 1000)
  const debouncedRadius = useDebounce(radius, 1000)

  // Use restaurants from session if available
  useEffect(() => {
    if (session?.restaurants && session.restaurants.length > 0) {
      devLog('Using restaurants from session:', session.restaurants)
      setRestaurants(session.restaurants)
      setHasAttemptedLoad(true)
      setIsInitialLoad(false)
    }
  }, [session])

  const fetchRestaurants = useCallback(async () => {
    // If we have restaurants from the session, don't fetch new ones
    if (session?.restaurants && session.restaurants.length > 0) {
      devLog('Using restaurants from session, skipping fetch')
      return
    }

    if (!debouncedLocation?.latitude || !debouncedLocation?.longitude) {
      devLog('No location available yet')
      return
    }

    // Check if location or filters have actually changed
    const locationChanged = 
      lastLocationRef.current?.lat !== debouncedLocation.latitude || 
      lastLocationRef.current?.lng !== debouncedLocation.longitude

    const filtersChanged = JSON.stringify(lastFiltersRef.current) !== JSON.stringify(debouncedFilters)
    const radiusChanged = lastRadiusRef.current !== debouncedRadius

    if (!locationChanged && !filtersChanged && !radiusChanged && !isInitialLoad) {
      devLog('Skipping fetch - no changes in location, filters, or radius')
      return
    }

    try {
      setLoading(true)
      setError(null)
      devLog('Fetching restaurants with location:', debouncedLocation)
      
      const results = await searchNearbyRestaurants({
        latitude: debouncedLocation.latitude,
        longitude: debouncedLocation.longitude,
        radius: debouncedRadius,
        filters: debouncedFilters
      })
      
      devLog('Received results:', results)
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
  }, [debouncedLocation, debouncedFilters, debouncedRadius, isInitialLoad, session])

  // Effect to handle initial load and location/filter changes
  useEffect(() => {
    if (debouncedLocation && !hasAttemptedLoad && !session?.restaurants) {
      fetchRestaurants()
    }
  }, [debouncedLocation, debouncedFilters, debouncedRadius, fetchRestaurants, hasAttemptedLoad, session])

  const handleStartNewSession = async () => {
    try {
      const newSession = await createSession('New Session', restaurants)
      if (newSession) {
        devLog('New session created:', newSession)
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
          devLog('Session URL copied to clipboard')
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
      <CustomListCreator />
      <Paper sx={{ p: 2, m: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isSessionLoading ? (
            <Typography>Loading session...</Typography>
          ) : !session ? (
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
          <FilterButton />
        </Box>
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
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '1rem' }}>
            {restaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                session={session}
              />
            ))}
          </div>
          <Paper sx={{ p: 2, m: 2 }}>
            <Typography variant="h6" gutterBottom>
              Voting Results
            </Typography>
            <ResultsChart session={session} />
          </Paper>
        </>
      ) : hasAttemptedLoad ? (
        <Paper sx={{ p: 2, m: 2 }}>
          <Typography>No restaurants found. Try adjusting your filters or increasing the search radius.</Typography>
        </Paper>
      ) : null}
    </div>
  )
} 