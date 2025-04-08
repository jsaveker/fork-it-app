import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import { FilterList } from '@mui/icons-material'
import { useFilters, Filters } from '../hooks/useFilters'

const PRICE_LEVELS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
]

const CUISINE_TYPES = [
  'American',
  'Italian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
  'Vegetarian',
  'Vegan',
]

export const FilterButton = () => {
  const [open, setOpen] = useState(false)
  const { filters, updateFilters } = useFilters()
  const [tempFilters, setTempFilters] = useState<Filters>(filters)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleApply = () => {
    updateFilters(tempFilters)
    handleClose()
  }

  const handleReset = () => {
    setTempFilters({
      rating: 0,
      priceLevel: [1, 2, 3, 4],
      cuisineTypes: []
    })
  }

  const handlePriceLevelChange = (event: any) => {
    setTempFilters(prev => ({
      ...prev,
      priceLevel: event.target.value
    }))
  }

  const handleCuisineTypeChange = (cuisineType: string) => {
    setTempFilters(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisineType)
        ? prev.cuisineTypes.filter(type => type !== cuisineType)
        : [...prev.cuisineTypes, cuisineType]
    }))
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        onClick={handleOpen}
      >
        Filters
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Restaurants</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Minimum Rating</Typography>
            <Slider
              value={tempFilters.rating}
              onChange={(_, value) => setTempFilters(prev => ({ ...prev, rating: value as number }))}
              min={0}
              max={5}
              step={0.5}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Price Level</InputLabel>
              <Select
                multiple
                value={tempFilters.priceLevel}
                onChange={handlePriceLevelChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={PRICE_LEVELS.find(level => level.value === value)?.label}
                      />
                    ))}
                  </Box>
                )}
              >
                {PRICE_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Cuisine Types</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {CUISINE_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleCuisineTypeChange(type)}
                  color={tempFilters.cuisineTypes.includes(type) ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  )
} 