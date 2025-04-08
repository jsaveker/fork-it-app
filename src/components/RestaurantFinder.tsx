import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { RestaurantCard } from './RestaurantCard'
import FilterPanel from './FilterPanel'
import LoadingSpinner from './LoadingSpinner'
import ErrorDisplay from './ErrorDisplay'
import { ZipCodeInput } from './ZipCodeInput'
import { useLocation } from '../hooks/useLocation'
import { useRestaurants } from '../hooks/useRestaurants'
import { useVotingContext } from '../hooks/VotingProvider'
import { addRestaurant } from '../services/sessionApi'
import { FilterOptions, Restaurant } from '../types'
import { useVoting } from '../hooks/useVoting'
import { Loader2 } from 'lucide-react'

const RestaurantFinder = () => {
  const { location, isLoading: isLocationLoading, error: locationError } = useLocation()
  const { session, isLoading: isSessionLoading, error: sessionError } = useVoting()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!location || !session) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/restaurants?lat=${location.lat}&lng=${location.lng}&radius=1500`)
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants')
        }
        const data = await response.json()
        setRestaurants(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
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
        <p className="text-red-500">{locationError}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{sessionError}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="text-center p-4">
        <p>Please enable location access to find restaurants near you.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}

export default RestaurantFinder 