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
- Google Places API key

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

3. Create a `.env` file in the root directory with your Google Places API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

This project is configured to be deployed on Cloudflare Pages. Simply connect your GitHub repository to Cloudflare Pages and it will automatically build and deploy your application.

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- Framer Motion
- Google Places API

## License

This project is licensed under the Apache 2.0 - see the LICENSE file for details.

## Acknowledgements

- Google Places API for restaurant data
- Material UI for component library
- Framer Motion for animations