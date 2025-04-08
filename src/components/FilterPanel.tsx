import { Box, Typography, Slider, Divider } from '@mui/material'
import { FilterOptions } from '../types'
import { useState, useEffect } from 'react'

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: Partial<FilterOptions>) => void
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [localMinPrice, setLocalMinPrice] = useState<number>(filters.minPrice)
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null)

  // Update local price when filters change
  useEffect(() => {
    setLocalMinPrice(filters.minPrice)
  }, [filters.minPrice])

  // Update URL when filters change
  useEffect(() => {
    const updateUrlWithFilters = () => {
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      
      // Update price parameters
      params.set('minPrice', filters.minPrice.toString())
      params.set('maxPrice', filters.maxPrice.toString())
      
      // Update distance parameter
      params.set('maxDistance', filters.maxDistance.toString())
      
      // Update rating parameter
      params.set('minRating', filters.minRating.toString())
      
      // Update URL without reloading the page
      const newUrl = `${url.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
    
    updateUrlWithFilters()
  }, [filters])

  const handleMaxDistanceChange = (_event: Event, value: number | number[]) => {
    onChange({ maxDistance: value as number })
  }

  const handleMinRatingChange = (_event: Event, value: number | number[]) => {
    onChange({ minRating: value as number })
  }

  const handleMinPriceChange = (_event: Event, value: number | number[]) => {
    const newMinPrice = value as number
    setLocalMinPrice(newMinPrice)
    
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set a new timer to update the filters after a delay
    const timer = setTimeout(() => {
      onChange({ minPrice: newMinPrice })
    }, 500) // 500ms delay
    
    setDebounceTimer(timer)
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Maximum Distance (meters)</Typography>
        <Slider
          value={filters.maxDistance}
          onChange={handleMaxDistanceChange}
          min={1000}
          max={10000}
          step={1000}
          marks={[
            { value: 1000, label: '1km' },
            { value: 5000, label: '5km' },
            { value: 10000, label: '10km' },
          ]}
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Minimum Rating</Typography>
        <Slider
          value={filters.minRating}
          onChange={handleMinRatingChange}
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
          value={localMinPrice}
          onChange={handleMinPriceChange}
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
    </Box>
  )
} 