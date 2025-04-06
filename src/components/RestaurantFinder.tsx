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
import RestaurantCard from './RestaurantCard'
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
  
  const { session, loading: sessionLoading, error: sessionError, loadSessionById, getAllVotes } = useVoting()
  const [addingRestaurant, setAddingRestaurant] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [showCopyMessage, setShowCopyMessage] = useState(false)

  const [showFilters, setShowFilters] = useState(false)

  // Load restaurants when location is available
  useEffect(() => {
    if (location) {
      findRestaurants()
    }
  }, [location])

  // Check for session ID in URL and load session if needed
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session')
    
    if (sessionId && session) {
      // If we have a session ID in the URL and a different session loaded,
      // load the session from the URL
      if (session.id !== sessionId) {
        loadSessionById(sessionId)
      }
    }
  }, [session])

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
  }, [session])

  // Function to find the restaurant with the highest votes
  const findHighestVotedRestaurant = (restaurants: Restaurant[]): Restaurant | null => {
    if (restaurants.length === 0) return null

    console.log('Finding highest voted restaurant among:', restaurants.length, 'restaurants')
    
    // Log all restaurants and their vote counts first
    console.log('All restaurants and their vote counts:')
    restaurants.forEach(restaurant => {
      const votes = getAllVotes(restaurant.id)
      const voteCount = votes.upvotes - votes.downvotes
      console.log(`- ${restaurant.name}: ${voteCount} votes (${votes.upvotes} up, ${votes.downvotes} down)`)
    })
    
    // Find the restaurant with the highest vote count
    let highestVotedRestaurant: Restaurant | null = null
    let highestVoteCount = -1 // Start at -1 so that 0 votes can be considered
    
    for (const restaurant of restaurants) {
      const votes = getAllVotes(restaurant.id)
      const voteCount = votes.upvotes - votes.downvotes
      
      console.log(`Checking restaurant: ${restaurant.name}, Votes: ${voteCount} (${votes.upvotes} up, ${votes.downvotes} down)`)
      
      // Only consider restaurants that have at least one vote
      if (votes.upvotes > 0 || votes.downvotes > 0) {
        if (voteCount >= highestVoteCount) {
          highestVoteCount = voteCount
          highestVotedRestaurant = restaurant
          console.log(`New highest voted restaurant: ${restaurant.name} with ${voteCount} votes`)
        }
      }
    }
    
    if (highestVotedRestaurant) {
      console.log(`Selected highest voted restaurant: ${highestVotedRestaurant.name} with ${highestVoteCount} votes`)
    } else {
      console.log('No restaurant with votes found')
    }
    
    return highestVotedRestaurant
  }

  const handleRandomRestaurant = () => {
    // If we have a session with restaurants, check if any have votes
    if (session && session.restaurants.length > 0) {
      console.log('Session has restaurants, checking for votes')
      console.log('Session ID:', session.id)
      console.log('Session restaurants:', session.restaurants.length)
      
      // Check if any restaurant has votes (upvotes or downvotes)
      let hasVotedRestaurants = false;
      
      // First, check if any restaurant has votes
      for (const restaurant of session.restaurants) {
        const votes = getAllVotes(restaurant.id);
        const hasVotes = votes.upvotes > 0 || votes.downvotes > 0;
        console.log(`Restaurant ${restaurant.name} has ${votes.upvotes} upvotes and ${votes.downvotes} downvotes: ${hasVotes ? 'has votes' : 'no votes'}`);
        
        if (hasVotes) {
          hasVotedRestaurants = true;
          break;
        }
      }
      
      console.log(`Has restaurants with votes: ${hasVotedRestaurants}`);
      
      if (hasVotedRestaurants) {
        // Make sure we're using the restaurants from the session
        const highestVotedRestaurant = findHighestVotedRestaurant(session.restaurants);
        
        if (highestVotedRestaurant) {
          console.log('Setting selected restaurant to highest voted:', highestVotedRestaurant.name);
          setSelectedRestaurant(highestVotedRestaurant);
          return;
        }
      }
    }
    
    console.log('No restaurants with votes found, selecting random restaurant');
    // Otherwise, get a random restaurant
    const restaurant = getRandomRestaurant();
    if (restaurant) {
      setSelectedRestaurant(restaurant);
      
      // Add the restaurant to the session if we have one
      if (session) {
        addRestaurantToSession(restaurant);
      }
    }
  }
  
  const addRestaurantToSession = async (restaurant: any) => {
    if (!session) return
    
    setAddingRestaurant(true)
    setAddError(null)
    
    try {
      await addRestaurant(session.id, restaurant)
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

  if (locationLoading || restaurantsLoading || sessionLoading) {
    return <LoadingSpinner message="Finding restaurants near you..." />
  }

  if (locationError || restaurantsError || sessionError) {
    return (
      <ErrorDisplay
        message={locationError || restaurantsError || sessionError || 'An error occurred'}
        onRetry={() => window.location.reload()}
      />
    )
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