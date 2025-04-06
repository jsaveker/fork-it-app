import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  Button,
  Typography,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import RestaurantCard from './RestaurantCard'
import FilterPanel from './FilterPanel'
import LoadingSpinner from './LoadingSpinner'
import ErrorDisplay from './ErrorDisplay'
import { useLocation } from '../hooks/useLocation'
import { useRestaurants } from '../hooks/useRestaurants'
import { FilterOptions } from '../types'

const RestaurantFinder = () => {
  const { location, loading: locationLoading, error: locationError } = useLocation()
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    selectedRestaurant,
    filters,
    findRestaurants,
    getRandomRestaurant,
    setSelectedRestaurant,
    updateFilters,
  } = useRestaurants()

  const [showFilters, setShowFilters] = useState(false)

  // Load restaurants when location is available
  useEffect(() => {
    if (location) {
      findRestaurants()
    }
  }, [location])

  const handleRandomRestaurant = () => {
    const restaurant = getRandomRestaurant()
    if (restaurant) {
      setSelectedRestaurant(restaurant)
    }
  }

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    updateFilters(newFilters)
    findRestaurants(newFilters)
  }

  if (locationLoading || restaurantsLoading) {
    return <LoadingSpinner message="Finding restaurants near you..." />
  }

  if (locationError || restaurantsError) {
    return (
      <ErrorDisplay
        message={locationError || restaurantsError || 'An error occurred'}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleRandomRestaurant}
            disabled={restaurants.length === 0}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              borderRadius: 3,
            }}
          >
            Find Random Restaurant
          </Button>
        </motion.div>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setShowFilters(!showFilters)}
          sx={{ mb: 2 }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <AnimatePresence mode="wait">
        {selectedRestaurant ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Selected Restaurant
              </Typography>
              <RestaurantCard restaurant={selectedRestaurant} />
            </Box>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {restaurants.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No restaurants found matching your criteria.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              updateFilters({
                distance: 5,
                rating: 0,
                priceLevel: [1, 2, 3, 4],
                cuisineTypes: [],
              })
              findRestaurants()
            }}
            sx={{ mt: 2 }}
          >
            Reset Filters
          </Button>
        </Box>
      )}
    </Container>
  )
}

export default RestaurantFinder 