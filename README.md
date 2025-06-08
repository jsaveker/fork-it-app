# Forkit 🍽️

A fun web application that helps indecisive office workers figure out where to go for lunch. Let the Lunch Oracle guide you to your next meal!

## Features

- 🎲 Random restaurant selection based on your location
- 🗺️ Uses browser geolocation to find nearby restaurants
- 🎨 Modern, clean UI with smooth animations
- 🎯 Food type filtering with multiple cuisine options
- 📏 Distance filtering (1-20 miles)
- ⭐ Rating filtering (0-5 stars)
- 💰 Price range filtering ($ to $$$$)
- 🗳️ Group voting system for shared restaurant lists
- 👍 Thumbs up/down voting on restaurant options
- 🌙 Dark mode support for comfortable viewing in any lighting
- 🔗 Shareable links for collaborative decision-making
- 📱 Responsive design for all devices
- 🍴 Fun fork emoji logo and playful UI elements

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fork-it.git
   cd fork-it
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and set the API URL and Google OAuth client ID:
   ```
   VITE_API_URL=https://api.fork-it.cc
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

This project is configured to be deployed on Cloudflare Pages. Simply connect your GitHub repository to Cloudflare Pages and it will automatically build and deploy your application.

### Setting up the Cloudflare Worker

1. Create a new Cloudflare Worker
2. Set the following environment variables in the Cloudflare dashboard:
   - `SESSIONS_KV`: A KV namespace for storing sessions

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- Framer Motion
- Cloudflare Workers

## License

This project is licensed under the Apache 2.0 - see the LICENSE file for details.

## Acknowledgements

- Material UI for component library
- Framer Motion for animations
- Cloudflare for hosting and serverless functions