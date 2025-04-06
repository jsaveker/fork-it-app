import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, SelectChangeEvent, Divider } from '@mui/material'
import { FilterOptions } from '../types'
import { useState, useEffect } from 'react'

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: Partial<FilterOptions>) => void
}

// Common cuisine types
const CUISINE_TYPES = [
  'american', 'italian', 'mexican', 'chinese', 'japanese', 'indian', 
  'thai', 'vietnamese', 'korean', 'mediterranean', 'greek', 'french',
  'spanish', 'middle_eastern', 'caribbean', 'latin_american', 'brazilian',
  'vegetarian', 'vegan', 'pizza', 'burger', 'sushi', 'bbq', 'seafood'
]

// Price level labels
const PRICE_LABELS = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$'
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [localDistance, setLocalDistance] = useState(filters.distance)
  const [localPriceLevel, setLocalPriceLevel] = useState<number>(filters.priceLevel[0])
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null)

  // Debounce the distance changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDistance !== filters.distance) {
        onChange({ distance: localDistance })
      }
    }, 500) // 500ms delay
    
    return () => clearTimeout(timer)
  }, [localDistance, filters.distance, onChange])

  // Update local price level when filters change
  useEffect(() => {
    setLocalPriceLevel(filters.priceLevel[0])
  }, [filters.priceLevel])

  const handleDistanceChange = (_event: Event, value: number | number[]) => {
    onChange({ distance: value as number })
  }

  const handleRatingChange = (_event: Event, value: number | number[]) => {
    onChange({ rating: value as number })
  }

  const handlePriceLevelChange = (_event: Event, value: number | number[]) => {
    const newPriceLevel = value as number
    setLocalPriceLevel(newPriceLevel)
    
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set a new timer to update the filters after a delay
    const timer = setTimeout(() => {
      onChange({ priceLevel: [newPriceLevel, 4] })
    }, 500) // 500ms delay
    
    setDebounceTimer(timer)
  }

  const handleCuisineChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onChange({
      cuisineTypes: typeof value === 'string' ? value.split(',') : value,
    })
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Distance (miles)</Typography>
        <Slider
          value={localDistance}
          onChange={handleDistanceChange}
          min={1}
          max={20}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 10, label: '10' },
            { value: 20, label: '20' },
          ]}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Minimum Rating</Typography>
        <Slider
          value={filters.rating}
          onChange={handleRatingChange}
          min={0}
          max={5}
          step={0.5}
          marks={[
            { value: 0, label: '0' },
            { value: 2.5, label: '2.5' },
            { value: 5, label: '5' },
          ]}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Minimum Price Level</Typography>
        <Slider
          value={localPriceLevel}
          onChange={handlePriceLevelChange}
          min={1}
          max={4}
          step={1}
          marks={[
            { value: 1, label: '$' },
            { value: 2, label: '$$' },
            { value: 3, label: '$$$' },
            { value: 4, label: '$$$$' },
          ]}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="cuisine-types-label">Cuisine Types</InputLabel>
        <Select
          labelId="cuisine-types-label"
          multiple
          value={filters.cuisineTypes}
          onChange={handleCuisineChange}
          input={<OutlinedInput label="Cuisine Types" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          <MenuItem value="American">American</MenuItem>
          <MenuItem value="Italian">Italian</MenuItem>
          <MenuItem value="Mexican">Mexican</MenuItem>
          <MenuItem value="Chinese">Chinese</MenuItem>
          <MenuItem value="Japanese">Japanese</MenuItem>
          <MenuItem value="Indian">Indian</MenuItem>
          <MenuItem value="Thai">Thai</MenuItem>
          <MenuItem value="Mediterranean">Mediterranean</MenuItem>
          <MenuItem value="Pizza">Pizza</MenuItem>
          <MenuItem value="Sushi">Sushi</MenuItem>
          <MenuItem value="Burgers">Burgers</MenuItem>
          <MenuItem value="BBQ">BBQ</MenuItem>
          <MenuItem value="Vegetarian">Vegetarian</MenuItem>
          <MenuItem value="Vegan">Vegan</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
} 