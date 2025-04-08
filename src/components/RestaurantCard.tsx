import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Rating,
} from '@mui/material'
import { Restaurant } from '../types'
import { VotingInterface } from './VotingInterface'
import { DirectionsWalk, AttachMoney } from '@mui/icons-material'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  // Format price level as dollar signs
  const formatPriceLevel = (level: number) => {
    return '$'.repeat(level)
  }

  // Format rating with one decimal place
  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {restaurant.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {restaurant.vicinity}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={restaurant.rating} 
            precision={0.5} 
            readOnly 
            size="small" 
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatRating(restaurant.rating)} ({restaurant.user_ratings_total} reviews)
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          {restaurant.price_level > 0 && (
            <Chip 
              icon={<AttachMoney />} 
              label={formatPriceLevel(restaurant.price_level)} 
              size="small" 
              variant="outlined" 
            />
          )}
          
          {restaurant.types && restaurant.types.includes('restaurant') && (
            <Chip 
              icon={<DirectionsWalk />} 
              label="Restaurant" 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <VotingInterface restaurant={restaurant} />
      </CardActions>
    </Card>
  )
} 