import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LocationData } from '../types'

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => void;
  setLocationFromZipCode: (zipCode: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Unknown error'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out'
            break
        }
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Function to set location from ZIP code
  const setLocationFromZipCode = async (zipCode: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Use a geocoding service to convert ZIP code to coordinates
      const response = await fetch(`https://api.fork-it.cc/geocode?zipCode=${zipCode}`)
      
      if (!response.ok) {
        throw new Error('Failed to geocode ZIP code')
      }
      
      const data = await response.json()
      
      if (!data.latitude || !data.longitude) {
        throw new Error('Invalid geocoding response')
      }
      
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        zipCode: zipCode,
      })
    } catch (err) {
      console.error('Error geocoding ZIP code:', err)
      setError('Failed to find location for ZIP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getLocation()
  }, [])

  const refreshLocation = () => {
    getLocation()
  }

  return (
    <LocationContext.Provider value={{ location, loading, error, refreshLocation, setLocationFromZipCode }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
} 