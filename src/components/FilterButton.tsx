import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Typography,
  Box,
} from '@mui/material'
import { FilterList } from '@mui/icons-material'
import { useFilters, Filters } from '../hooks/useFilters'

const PRICE_LABELS = ['$', '$$', '$$$', '$$$$']

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
      minRating: 0,
      maxDistance: 5000,
      minPrice: 1,
      maxPrice: 4
    })
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`
    }
    return `${meters}m`
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
              value={tempFilters.minRating}
              onChange={(_, value) => setTempFilters(prev => ({ ...prev, minRating: value as number }))}
              min={0}
              max={5}
              step={0.5}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0' },
                { value: 2.5, label: '2.5' },
                { value: 5, label: '5' }
              ]}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Maximum Distance</Typography>
            <Slider
              value={tempFilters.maxDistance}
              onChange={(_, value) => setTempFilters(prev => ({ ...prev, maxDistance: value as number }))}
              min={500}
              max={10000}
              step={500}
              valueLabelDisplay="auto"
              valueLabelFormat={formatDistance}
              marks={[
                { value: 500, label: '500m' },
                { value: 5000, label: '5km' },
                { value: 10000, label: '10km' }
              ]}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Price Range</Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={[tempFilters.minPrice, tempFilters.maxPrice]}
                onChange={(_, value) => {
                  const [min, max] = value as number[]
                  setTempFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))
                }}
                min={1}
                max={4}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => PRICE_LABELS[value - 1]}
                marks={PRICE_LABELS.map((label, index) => ({
                  value: index + 1,
                  label
                }))}
              />
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