# Harmony - Listen Together, Anywhere

Harmony is a web application that allows users to create virtual rooms where they and their friends can enjoy music in perfect sync, chat, and build playlists together.

> **Note:** This project is currently in the building stage.

## Features

- **Virtual Music Rooms**: Create and join rooms to listen to music with friends
- **Spotify Integration**: Connect with Spotify to access your playlists and favorite tracks
- **Synchronized Playback**: Listen to music in perfect sync with everyone in the room
- **Music Queue Management**: Add songs to the queue and control playback together
- **User Authentication**: Secure login with Spotify OAuth via Supabase

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query
- **Authentication**: Supabase Auth with Spotify OAuth
- **Music Playback**: Spotify Web Player SDK
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun package manager
- Spotify Developer Account (for API access)
- Supabase Account (for authentication and database)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/harmony-react.git
   cd harmony-react
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_REDIRECT_URI=your_spotify_redirect_uri_from_supabase
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

## Development

- **Development Mode**: `bun run dev`
- **Build for Production**: `bun run build`
- **Preview Production Build**: `bun run preview`
- **Lint Code**: `bun run lint`
- **Format Code**: `bun run format:write`

## Project Structure

```
harmony-react/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (auth, etc.)
│   ├── lib/            # Utility functions and types
│   ├── pages/          # Page components
│   ├── services/       # API and service functions
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.tsx        # Application entry point
└── ...config files
```

## Current Status

This project is actively under development. Some features may be incomplete or subject to change.

## Acknowledgements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Supabase](https://supabase.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
