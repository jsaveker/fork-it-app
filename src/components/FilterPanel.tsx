import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material'
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
  // Local state for distance to implement debouncing
  const [localDistance, setLocalDistance] = useState(filters.distance)
  
  // Debounce the distance changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDistance !== filters.distance) {
        onChange({ distance: localDistance })
      }
    }, 500) // 500ms delay
    
    return () => clearTimeout(timer)
  }, [localDistance, filters.distance, onChange])

  return (
    <Box sx={{ p: 2 }}>
      <Typography gutterBottom>Distance (miles)</Typography>
      <Slider
        value={localDistance}
        min={1}
        max={20}
        step={1}
        marks={[
          { value: 1, label: '1' },
          { value: 5, label: '5' },
          { value: 10, label: '10' },
          { value: 15, label: '15' },
          { value: 20, label: '20' }
        ]}
        onChange={(_, value) => setLocalDistance(value as number)}
        valueLabelDisplay="on"
        valueLabelFormat={(value) => `${value} miles`}
      />

      <Typography gutterBottom>Minimum Rating</Typography>
      <Slider
        value={filters.rating}
        min={0}
        max={5}
        step={0.5}
        marks={[
          { value: 0, label: '0' },
          { value: 2.5, label: '2.5' },
          { value: 5, label: '5' }
        ]}
        onChange={(_, value) => onChange({ rating: value as number })}
        valueLabelDisplay="on"
        valueLabelFormat={(value) => `${value} stars`}
      />

      <Typography gutterBottom>Minimum Price Level</Typography>
      <Slider
        value={filters.priceLevel.length > 0 ? Math.min(...filters.priceLevel) : 1}
        min={1}
        max={4}
        step={1}
        marks={[
          { value: 1, label: '$' },
          { value: 2, label: '$$' },
          { value: 3, label: '$$$' },
          { value: 4, label: '$$$$' }
        ]}
        onChange={(_, value) => {
          const minPrice = value as number;
          // Create a range from minPrice to 4
          const priceRange = Array.from(
            { length: 5 - minPrice }, 
            (_, i) => minPrice + i
          );
          onChange({ priceLevel: priceRange });
        }}
        valueLabelDisplay="on"
        valueLabelFormat={(value) => PRICE_LABELS[value as keyof typeof PRICE_LABELS] || ''}
      />

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="cuisine-types-label">Cuisine Types</InputLabel>
        <Select
          labelId="cuisine-types-label"
          multiple
          value={filters.cuisineTypes}
          onChange={(event) => {
            const value = event.target.value as string[]
            onChange({ cuisineTypes: value })
          }}
          input={<OutlinedInput label="Cuisine Types" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value.replace('_', ' ')} />
              ))}
            </Box>
          )}
        >
          {CUISINE_TYPES.map((cuisine) => (
            <MenuItem key={cuisine} value={cuisine}>
              {cuisine.replace('_', ' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
} 