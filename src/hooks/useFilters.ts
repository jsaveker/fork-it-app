import { useState, useCallback } from 'react'

export interface Filters {
  rating: number
  priceLevel: number[]
  cuisineTypes: string[]
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    rating: 0,
    priceLevel: [1, 2, 3, 4],
    cuisineTypes: []
  })

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  return {
    filters,
    updateFilters
  }
} 