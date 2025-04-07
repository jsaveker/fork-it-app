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
import { useLocation } from '../hooks/useLocation'
import { useRestaurants } from '../hooks/useRestaurants'
import { useVoting } from '../hooks/useVoting'
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
  
  const { session, error: sessionError, loadSessionById, getAllVotes, setSession } = useVoting()
  const [addingRestaurant, setAddingRestaurant] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [showCopyMessage, setShowCopyMessage] = useState(false)

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
    const sessionId = urlParams.get('session')
    
    console.log('Checking for session ID in URL:', sessionId)
    console.log('Current session:', session?.id)
    
    if (sessionId && (!session || session.id !== sessionId)) {
      console.log('Loading session from URL:', sessionId)
      loadSessionById(sessionId)
    }
  }, [session, loadSessionById])

  // Select the highest-voted restaurant when the session changes
  useEffect(() => {
    if (session && session.restaurants.length > 0) {
      console.log('Session changed, finding highest voted restaurant')
      console.log('Session ID:', session.id)
      console.log('Session restaurants:', session.restaurants.length)
      
      // Find the restaurant with the highest votes
      const highestVotedRestaurant = findHighestVotedRestaurant(session.restaurants)
      if (highestVotedRestaurant) {
        console.log('Setting selected restaurant to highest voted:', highestVotedRestaurant.name)
        setSelectedRestaurant(highestVotedRestaurant)
      }
    }
  }, [session, getAllVotes])

  // Function to find the restaurant with the highest votes
  const findHighestVotedRestaurant = (restaurants: Restaurant[]): Restaurant | null => {
    if (restaurants.length === 0) return null

    console.log('Finding highest voted restaurant among:', restaurants.length, 'restaurants')
    
    let highestVotedRestaurant: Restaurant | null = null
    let highestVoteCount = -1
    
    // Load all votes in one batch
    const restaurantIds = restaurants.map(r => r.id)
    
    // Use Promise.all to handle the batch request
    Promise.all(restaurantIds.map(id => getAllVotes(id)))
      .then(voteResults => {
        // Process the votes result
        const votes: Record<string, { upvotes: number; downvotes: number }> = {}
        
        restaurantIds.forEach((id, index) => {
          const voteResult = voteResults[index]
          if (typeof voteResult === 'object' && 'upvotes' in voteResult && 'downvotes' in voteResult) {
            votes[id] = voteResult as { upvotes: number; downvotes: number }
          }
        })
        
        for (const restaurant of restaurants) {
          const restaurantVotes = votes[restaurant.id] || { upvotes: 0, downvotes: 0 }
          const voteCount = restaurantVotes.upvotes - restaurantVotes.downvotes
          
          console.log(`Checking restaurant: ${restaurant.name}, Votes: ${voteCount} (${restaurantVotes.upvotes} up, ${restaurantVotes.downvotes} down)`)
          
          if (voteCount > highestVoteCount) {
            highestVoteCount = voteCount
            highestVotedRestaurant = restaurant
            console.log(`New highest voted restaurant: ${restaurant.name} with ${voteCount} votes`)
          }
        }
        
        if (highestVotedRestaurant) {
          console.log(`Selected highest voted restaurant: ${highestVotedRestaurant.name} with ${highestVoteCount} votes`)
        } else {
          console.log('No restaurant with votes found')
        }
      })
      .catch(error => {
        console.error('Error loading votes:', error)
      })
    
    return highestVotedRestaurant
  }

  const handleRandomRestaurant = () => {
    // If we have a session with restaurants, check if any have votes
    if (session && session.restaurants.length > 0) {
      console.log('Session has restaurants, checking for votes')
      console.log('Session ID:', session.id)
      console.log('Session restaurants:', session.restaurants.length)
      
      // Find the highest voted restaurant
      const highestVotedRestaurant = findHighestVotedRestaurant(session.restaurants)
      
      if (highestVotedRestaurant) {
        console.log('Setting selected restaurant to highest voted:', highestVotedRestaurant.name)
        setSelectedRestaurant(highestVotedRestaurant)
        return
      }
    }
    
    console.log('No restaurants with votes found, selecting random restaurant')
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
      
      // Check if this restaurant should be the selected one
      const votesResult = await getAllVotes(restaurant.id)
      const votes = typeof votesResult === 'object' && !Array.isArray(votesResult) && 'upvotes' in votesResult
        ? votesResult as { upvotes: number; downvotes: number }
        : { upvotes: 0, downvotes: 0 }
      
      const voteCount = votes.upvotes - votes.downvotes
      
      // If this restaurant has more votes than the current selected restaurant, select it
      if (selectedRestaurant) {
        const selectedVotesResult = await getAllVotes(selectedRestaurant.id)
        const selectedVotes = typeof selectedVotesResult === 'object' && !Array.isArray(selectedVotesResult) && 'upvotes' in selectedVotesResult
          ? selectedVotesResult as { upvotes: number; downvotes: number }
          : { upvotes: 0, downvotes: 0 }
        
        const selectedVoteCount = selectedVotes.upvotes - selectedVotes.downvotes
        
        if (voteCount > selectedVoteCount) {
          console.log('New restaurant has more votes, selecting it:', restaurant.name)
          setSelectedRestaurant(restaurant)
        }
      } else {
        // If no restaurant is selected, select this one
        console.log('No restaurant selected, selecting this one:', restaurant.name)
        setSelectedRestaurant(restaurant)
      }
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

  if (locationError) {
    return (
      <ErrorDisplay
        message="Unable to get your location. Please enable location services and refresh the page."
        onRetry={() => window.location.reload()}
      />
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

  if (locationLoading && !location) {
    return <LoadingSpinner message="Getting your location..." />
  }

  if (restaurantsLoading && restaurants.length === 0) {
    return <LoadingSpinner message="Finding restaurants near you..." />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
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
              mb: 2,
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