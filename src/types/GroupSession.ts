export interface RestaurantVote {
  restaurantId: string
  upvotes: string[]
  downvotes: string[]
}

export interface GroupSession {
  id: string
  name: string
  createdAt: string
  votes: RestaurantVote[]
} 