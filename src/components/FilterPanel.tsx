import { Box, Typography, Slider } from '@mui/material'
import { FilterOptions } from '../types'

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: Partial<FilterOptions>) => void
}

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
    </Box>
  )
} 