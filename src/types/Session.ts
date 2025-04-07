import { Restaurant } from './Restaurant'

export interface Session {
  id: string
  restaurants: Restaurant[]
  expires: string
  createdAt: string
  updatedAt: string
} 