import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
} from '@mui/material'
import { Restaurant } from '../types'
import VotingInterface from './VotingInterface'

interface RestaurantCardProps {
  restaurant: Restaurant
}

const getPriceLevel = (level: number | undefined) => {
  if (!level) return 'Price not available'
  return '$'.repeat(level)
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {restaurant.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {restaurant.vicinity}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={restaurant.rating} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({restaurant.user_ratings_total})
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {getPriceLevel(restaurant.price_level)}
        </Typography>
        <Box sx={{ mt: 1 }}>
          {restaurant.types.map((type) => (
            <Typography
              key={type}
              variant="body2"
              color="text.secondary"
              component="span"
              sx={{ mr: 1 }}
            >
              {type}
            </Typography>
          ))}
        </Box>
        <Box sx={{ mt: 2 }}>
          <VotingInterface restaurant={restaurant} />
        </Box>
      </CardContent>
    </Card>
  )
} 