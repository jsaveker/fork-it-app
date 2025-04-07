import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
} from '@mui/material'
import { Restaurant } from '../types/Restaurant'
import { VotingInterface } from './VotingInterface'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2">
          {restaurant.name}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {restaurant.vicinity}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={restaurant.rating} readOnly precision={0.5} />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            ({restaurant.user_ratings_total} reviews)
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Price Level: {'$'.repeat(restaurant.price_level || 0)}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <VotingInterface restaurant={restaurant} />
        </Box>
      </CardContent>
    </Card>
  )
} 