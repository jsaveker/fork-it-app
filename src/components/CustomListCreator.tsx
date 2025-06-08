import { useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Chip } from '@mui/material'
import { Restaurant } from '../types'
import { useSession } from '../hooks/useSession'

export default function CustomListCreator() {
  const [restaurantName, setRestaurantName] = useState('')
  const [list, setList] = useState<Restaurant[]>([])
  const [randomPick, setRandomPick] = useState<Restaurant | null>(null)
  const { createSession } = useSession()

  const addRestaurant = () => {
    if (!restaurantName.trim()) return
    const newRestaurant: Restaurant = {
      id: crypto.randomUUID(),
      name: restaurantName.trim(),
      vicinity: '',
      rating: 0,
      user_ratings_total: 0,
      price_level: 0,
      geometry: { location: { lat: 0, lng: 0 } },
      types: ['restaurant']
    }
    setList(prev => [...prev, newRestaurant])
    setRestaurantName('')
  }

  const removeRestaurant = (id: string) => {
    setList(prev => prev.filter(r => r.id !== id))
  }

  const pickRandom = () => {
    if (list.length === 0) return
    const idx = Math.floor(Math.random() * list.length)
    setRandomPick(list[idx])
  }

  const startSession = async () => {
    if (list.length === 0) return
    await createSession('Lunch List', list)
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create Custom Restaurant List
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Restaurant Name"
          value={restaurantName}
          onChange={e => setRestaurantName(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={addRestaurant}>Add</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {list.map(item => (
          <Chip key={item.id} label={item.name} onDelete={() => removeRestaurant(item.id)} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Button variant="outlined" onClick={pickRandom}>Pick Random</Button>
        <Button variant="contained" onClick={startSession}>Start Voting Session</Button>
      </Box>
      {randomPick && (
        <Typography variant="body1">Today's pick: {randomPick.name}</Typography>
      )}
    </Paper>
  )
}
