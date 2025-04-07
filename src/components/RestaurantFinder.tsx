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
  
  const { session, error: sessionError, setSession, createSession, getSessionUrl } = useVotingContext()
  const [addingRestaurant, setAddingRestaurant] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [showCopyMessage, setShowCopyMessage] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  const [showFilters, setShowFilters] = useState(false)

  // Load restaurants when location is available
  useEffect(() => {
    if (location) {
      console.log('Location available, finding restaurants:', location)
      findRestaurants()
    }
  }, [location])

  // Check for session ID in URL and load session if needed
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    // Apply filter parameters from URL
    const price = urlParams.get('price')
    const distance = urlParams.get('distance')
    const rating = urlParams.get('rating')
    const cuisine = urlParams.get('cuisine')
    
    const newFilters: Partial<FilterOptions> = {}
    
    if (price) {
      const priceLevels = price.split(',').map(p => parseInt(p, 10))
      if (priceLevels.length > 0) {
        newFilters.priceLevel = priceLevels
      }
    }
    
    if (distance) {
      const distanceValue = parseFloat(distance)
      if (!isNaN(distanceValue)) {
        newFilters.distance = distanceValue
      }
    }
    
    if (rating) {
      const ratingValue = parseFloat(rating)
      if (!isNaN(ratingValue)) {
        newFilters.rating = ratingValue
      }
    }
    
    if (cuisine) {
      const cuisineTypes = cuisine.split(',')
      if (cuisineTypes.length > 0) {
        newFilters.cuisineTypes = cuisineTypes
      }
    }
    
    // Apply the filters if any were found in the URL
    if (Object.keys(newFilters).length > 0) {
      console.log('Applying filters from URL:', newFilters)
      updateFilters(newFilters)
      findRestaurants(newFilters)
    }
  }, []) // Only run once on component mount

  // Select the highest-voted restaurant when the session changes
  useEffect(() => {
    if (session && session.restaurants.length > 0) {
      console.log('Session changed, selecting first restaurant')
      console.log('Session ID:', session.id)
      console.log('Session restaurants:', session.restaurants.length)
      
      // Just select the first restaurant
      const firstRestaurant = session.restaurants[0]
      if (firstRestaurant) {
        console.log('Setting selected restaurant to first one:', firstRestaurant.name)
        setSelectedRestaurant(firstRestaurant)
      }
    }
  }, [session]) // Only depend on session changes

  const handleRandomRestaurant = () => {
    // If we have a session with restaurants, check if any have votes
    if (session && session.restaurants.length > 0) {
      console.log('Session has restaurants, selecting first one')
      console.log('Session ID:', session.id)
      console.log('Session restaurants:', session.restaurants.length)
      
      // Just select the first restaurant for now
      const firstRestaurant = session.restaurants[0]
      if (firstRestaurant) {
        console.log('Setting selected restaurant to first one:', firstRestaurant.name)
        setSelectedRestaurant(firstRestaurant)
        return
      }
    }
    
    console.log('No restaurants in session, selecting random restaurant')
    // Otherwise, get a random restaurant
    const restaurant = getRandomRestaurant()
    if (restaurant) {
      setSelectedRestaurant(restaurant)
      
      // Add the restaurant to the session if we have one
      if (session) {
        addRestaurantToSession(restaurant)
      }
    }
  }
  
  const addRestaurantToSession = async (restaurant: Restaurant) => {
    if (!session) {
      console.error('Cannot add restaurant without an active session')
      return
    }
    
    setAddingRestaurant(true)
    setAddError(null)
    
    try {
      console.log('Adding restaurant to session:', restaurant.name)
      const updatedSession = await addRestaurant(session.id, restaurant)
      console.log('Restaurant added to session:', updatedSession.id)
      
      // Update the session state with the updated session
      if (updatedSession) {
        setSession(updatedSession)
      }
      
      // Just select this restaurant without checking votes
      setSelectedRestaurant(restaurant)
    } catch (err) {
      console.error('Error adding restaurant to session:', err)
      setAddError('Failed to add restaurant to session')
    } finally {
      setAddingRestaurant(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    updateFilters(newFilters)
    findRestaurants(newFilters)
  }

  const handleCreateSession = async () => {
    setCreatingSession(true)
    try {
      console.log('Creating new session...')
      const newSession = await createSession('Restaurant Voting Session')
      console.log('New session created:', newSession)
      
      if (newSession && selectedRestaurant) {
        // If we have a selected restaurant, add it to the new session
        console.log('Adding selected restaurant to session:', selectedRestaurant)
        await addRestaurantToSession(selectedRestaurant)
      }
      
      // Copy the session URL to the clipboard
      const sessionUrl = getSessionUrl()
      console.log('Session URL:', sessionUrl)
      if (sessionUrl) {
        console.log('Copying session URL to clipboard:', sessionUrl)
        try {
          navigator.clipboard.writeText(sessionUrl)
            .then(() => {
              console.log('Session URL copied to clipboard successfully')
              setShowCopyMessage(true)
            })
            .catch(err => {
              console.error('Error copying to clipboard:', err)
              // Fallback for clipboard API not available
              const textArea = document.createElement('textarea')
              textArea.value = sessionUrl
              document.body.appendChild(textArea)
              textArea.select()
              document.execCommand('copy')
              document.body.removeChild(textArea)
              console.log('Session URL copied to clipboard using fallback method')
              setShowCopyMessage(true)
            })
        } catch (err) {
          console.error('Error with clipboard API:', err)
          // Fallback for clipboard API not available
          const textArea = document.createElement('textarea')
          textArea.value = sessionUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          console.log('Session URL copied to clipboard using fallback method')
          setShowCopyMessage(true)
        }
      }
    } catch (error) {
      console.error('Error creating session:', error)
      setAddError('Failed to create session')
    } finally {
      setCreatingSession(false)
    }
  }

  // Show error if location services are denied
  if (locationError) {
    return (
      <Container maxWidth="md">
        <ZipCodeInput />
      </Container>
    )
  }

  if (restaurantsError || sessionError) {
    return (
      <ErrorDisplay
        message={restaurantsError || sessionError || 'An error occurred'}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Show loading state while getting location
  if (locationLoading && !location) {
    return <LoadingSpinner message="Getting your location..." />
  }

  if (restaurantsLoading && restaurants.length === 0) {
    return <LoadingSpinner message="Finding restaurants near you..." />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {!session && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleCreateSession}
              disabled={creatingSession}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                borderRadius: 3,
              }}
            >
              {creatingSession ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Start Voting Session'
              )}
            </Button>
          </motion.div>
        )}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleRandomRestaurant}
            disabled={restaurants.length === 0 || addingRestaurant}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              borderRadius: 3,
            }}
          >
            {addingRestaurant ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Find Random Restaurant'
            )}
          </Button>
        </motion.div>
      </Box>
      
      {addError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {addError}
        </Alert>
      )}

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
      
      <Snackbar
        open={showCopyMessage}
        autoHideDuration={3000}
        onClose={() => setShowCopyMessage(false)}
        message="Session link copied to clipboard!"
      />
    </Container>
  )
}

export default RestaurantFinder 