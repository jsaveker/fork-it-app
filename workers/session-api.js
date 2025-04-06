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

    try {
      // Handle different endpoints
      if (path === '/sessions' && request.method === 'POST') {
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