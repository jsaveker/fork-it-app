/**
 * Session API Worker
 * 
 * This worker handles session storage and retrieval for the Fork-it app.
 * It provides endpoints for creating, retrieving, updating, and deleting sessions.
 */

// Define the session structure
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper function to generate a unique ID
function generateId() {
  return crypto.randomUUID();
}

// Helper function to create a new session
function createSession(name) {
  const now = Date.now();
  return {
    id: generateId(),
    name: name || 'Default Session',
    restaurants: [],
    votes: [],
    createdAt: new Date(now).toISOString(),
    expires: now + SESSION_EXPIRY
  };
}

// Main request handler
export default {
  async fetch(request, env) {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Parse the URL to get the path and query parameters
    const url = new URL(request.url);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);

    // Get the KV namespace for storing sessions
    const SESSIONS = env.SESSIONS_KV;
    
    // Get the Google Places API key from environment variables
    const GOOGLE_PLACES_API_KEY = env.GOOGLE_PLACES_API_KEY;

    try {
      // Handle different endpoints
      if (path === '/geocode' && request.method === 'GET') {
        // Geocode a ZIP code to coordinates
        const zipCode = params.zipCode;
        
        if (!zipCode) {
          return new Response(JSON.stringify({ error: 'ZIP code is required' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        // Use Google Geocoding API to convert ZIP code to coordinates
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${GOOGLE_PLACES_API_KEY}`;
        const geocodeResponse = await fetch(geocodeUrl);
        
        if (!geocodeResponse.ok) {
          return new Response(JSON.stringify({ error: 'Failed to geocode ZIP code' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
          return new Response(JSON.stringify({ error: 'ZIP code not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const location = geocodeData.results[0].geometry.location;
        
        return new Response(JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          zipCode: zipCode,
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path === '/sessions' && request.method === 'POST') {
        // Create a new session
        const body = await request.json();
        const session = createSession(body.name);
        
        // Store the session in KV
        await SESSIONS.put(session.id, JSON.stringify(session));
        
        return new Response(JSON.stringify(session), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } 
      else if (path === '/sessions' && request.method === 'GET') {
        // Get all sessions (for admin purposes)
        const sessions = [];
        const list = await SESSIONS.list();
        
        for (const key of list.keys) {
          const sessionData = await SESSIONS.get(key.name);
          if (sessionData) {
            sessions.push(JSON.parse(sessionData));
          }
        }
        
        return new Response(JSON.stringify(sessions), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path.startsWith('/sessions/') && request.method === 'GET') {
        // Get a specific session by ID
        const sessionId = path.split('/')[2];
        const sessionData = await SESSIONS.get(sessionId);
        
        if (!sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        return new Response(sessionData, {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path.startsWith('/sessions/') && request.method === 'PUT') {
        // Update a session
        const sessionId = path.split('/')[2];
        const sessionData = await SESSIONS.get(sessionId);
        
        if (!sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const body = await request.json();
        const session = JSON.parse(sessionData);
        
        // Update session properties
        if (body.name) session.name = body.name;
        if (body.restaurants) session.restaurants = body.restaurants;
        if (body.votes) session.votes = body.votes;
        
        // Update expiry
        session.expires = Date.now() + SESSION_EXPIRY;
        
        // Save the updated session
        await SESSIONS.put(sessionId, JSON.stringify(session));
        
        return new Response(JSON.stringify(session), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path.startsWith('/sessions/') && request.method === 'DELETE') {
        // Delete a session
        const sessionId = path.split('/')[2];
        await SESSIONS.delete(sessionId);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path === '/vote' && request.method === 'POST') {
        // Handle voting
        const { sessionId, restaurantId, userId, isUpvote } = await request.json();
        
        if (!sessionId || !restaurantId || !userId) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const sessionData = await SESSIONS.get(sessionId);
        
        if (!sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const session = JSON.parse(sessionData);
        
        // Find the vote for this restaurant
        let restaurantVote = session.votes.find(v => v.restaurantId === restaurantId);
        
        // If no vote exists for this restaurant, create one
        if (!restaurantVote) {
          restaurantVote = {
            restaurantId,
            upvotes: [],
            downvotes: []
          };
          session.votes.push(restaurantVote);
        }
        
        // Remove any existing votes by this user for this restaurant
        restaurantVote.upvotes = restaurantVote.upvotes.filter(id => id !== userId);
        restaurantVote.downvotes = restaurantVote.downvotes.filter(id => id !== userId);
        
        // Add the new vote
        if (isUpvote) {
          restaurantVote.upvotes.push(userId);
        } else {
          restaurantVote.downvotes.push(userId);
        }
        
        // Save the updated session
        await SESSIONS.put(sessionId, JSON.stringify(session));
        
        return new Response(JSON.stringify(session), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path === '/add-restaurant' && request.method === 'POST') {
        // Add a restaurant to a session
        const { sessionId, restaurant } = await request.json();
        
        if (!sessionId || !restaurant) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const sessionData = await SESSIONS.get(sessionId);
        
        if (!sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const session = JSON.parse(sessionData);
        
        // Check if restaurant already exists in the session
        if (!session.restaurants.some(r => r.id === restaurant.id)) {
          session.restaurants.push(restaurant);
          
          // Update expiry
          session.expires = Date.now() + SESSION_EXPIRY;
          
          // Save the updated session
          await SESSIONS.put(sessionId, JSON.stringify(session));
        }
        
        return new Response(JSON.stringify(session), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      else if (path === '/places/nearby' && request.method === 'POST') {
        // Handle Google Places API requests
        if (!GOOGLE_PLACES_API_KEY) {
          return new Response(JSON.stringify({ error: 'Google Places API key is not configured' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const { latitude, longitude, radius, filters } = await request.json();
        
        if (!latitude || !longitude || !radius) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        // Build the query parameters for the Google Places API
        const queryParams = new URLSearchParams({
          location: `${latitude},${longitude}`,
          radius: radius.toString(),
          type: 'restaurant',
          key: GOOGLE_PLACES_API_KEY,
        });
        
        // Add optional filters if they're set
        if (filters && filters.rating > 0) {
          queryParams.append('minprice', '0');
          queryParams.append('maxprice', '4');
        }
        
        // Make the API request to Google Places API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${queryParams.toString()}`
        );
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch restaurants from Google Places API' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        const data = await response.json();
        
        if (data.status !== 'OK') {
          return new Response(JSON.stringify({ error: `Google Places API error: ${data.status}` }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
        
        // Filter and format the results
        const results = data.results
          .filter(place => {
            // Apply our custom filters
            if (filters && filters.rating > 0 && (!place.rating || place.rating < filters.rating)) {
              return false;
            }
            
            if (
              filters &&
              filters.priceLevel &&
              filters.priceLevel.length > 0 &&
              (!place.price_level || !filters.priceLevel.includes(place.price_level))
            ) {
              return false;
            }
            
            if (filters && filters.cuisineTypes && filters.cuisineTypes.length > 0) {
              const placeTypes = place.types || [];
              const hasMatchingCuisine = filters.cuisineTypes.some(cuisine =>
                placeTypes.includes(cuisine)
              );
              if (!hasMatchingCuisine) return false;
            }
            
            return true;
          })
          .map(place => ({
            id: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            price_level: place.price_level || 0,
            geometry: place.geometry,
            types: place.types || [],
          }));
        
        return new Response(JSON.stringify({ results }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
      
      // Return 404 for any other paths
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      // Handle any errors
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  }
}; 