import { RestaurantVote } from '../types'

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fork-it.cc'

// Get upvotes for a restaurant
export const getUpvotes = async (sessionId: string, restaurantId: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to get upvotes');
    }
    const session = await response.json();
    const restaurantVote = session.votes.find((v: RestaurantVote) => v.restaurantId === restaurantId);
    return restaurantVote ? restaurantVote.upvotes : [];
  } catch (error) {
    console.error('Error getting upvotes:', error);
    return [];
  }
}

// Get downvotes for a restaurant
export const getDownvotes = async (sessionId: string, restaurantId: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to get downvotes');
    }
    const session = await response.json();
    const restaurantVote = session.votes.find((v: RestaurantVote) => v.restaurantId === restaurantId);
    return restaurantVote ? restaurantVote.downvotes : [];
  } catch (error) {
    console.error('Error getting downvotes:', error);
    return [];
  }
}

// Upvote a restaurant
export const upvoteRestaurant = async (sessionId: string, restaurantId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        restaurantId,
        userId,
        isUpvote: true,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error upvoting restaurant:', error);
    return false;
  }
}

// Downvote a restaurant
export const downvoteRestaurant = async (sessionId: string, restaurantId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        restaurantId,
        userId,
        isUpvote: false,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error downvoting restaurant:', error);
    return false;
  }
} 