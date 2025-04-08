import { useState, useCallback, useEffect } from 'react'
import { useSession } from './useSession'

export interface Filters {
  minRating: number
  maxDistance: number
  minPrice: number
  maxPrice: number
}

const DEFAULT_FILTERS: Filters = {
  minRating: 0,
  maxDistance: 5000, // 5km in meters
  minPrice: 1,
  maxPrice: 4
}

export function useFilters() {
  const { session } = useSession()
  const [filters, setFilters] = useState<Filters>(() => {
    // Try to get filters from session
    if (session?.filters) {
      return session.filters as Filters
    }
    return DEFAULT_FILTERS
  })

  // Update filters when session changes
  useEffect(() => {
    if (session?.filters) {
      setFilters(session.filters as Filters)
    } else {
      setFilters(DEFAULT_FILTERS)
    }
  }, [session])

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update session with new filters
    if (session) {
      session.filters = updatedFilters
    }
  }, [filters, session])

  return {
    filters,
    updateFilters
  }
} 