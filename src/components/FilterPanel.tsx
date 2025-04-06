import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material'
import { FilterOptions } from '../types'

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

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography gutterBottom>Distance (miles)</Typography>
      <Slider
        value={filters.distance}
        min={1}
        max={20}
        step={1}
        marks
        onChange={(_, value) => onChange({ distance: value as number })}
      />

      <Typography gutterBottom>Minimum Rating</Typography>
      <Slider
        value={filters.rating}
        min={0}
        max={5}
        step={0.5}
        marks
        onChange={(_, value) => onChange({ rating: value as number })}
      />

      <Typography gutterBottom>Price Level</Typography>
      <Slider
        value={filters.priceLevel}
        min={1}
        max={4}
        step={1}
        marks
        onChange={(_, value) => onChange({ priceLevel: Array.isArray(value) ? value : [value] })}
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