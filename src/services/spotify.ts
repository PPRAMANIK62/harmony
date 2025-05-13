import { supabase } from "@/integrations/supabase/client";

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
  product: string;
  country: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  artists: {
    id: string;
    name: string;
  }[];
  duration_ms: number;
  preview_url: string | null;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  artists: {
    id: string;
    name: string;
  }[];
  release_date: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
}

export interface SearchResults {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
}

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

// Get token from session
export const getSessionToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.provider_token || null;
  } catch (error) {
    console.error("Error getting session token:", error);
    return null;
  }
};

// API call helper
const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body?: unknown
) => {
  // Get token from session
  const token = await getSessionToken();

  if (!token) throw new Error("No Spotify auth token available");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const config: RequestInit = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${SPOTIFY_BASE_URL}${endpoint}`, config);

  // Handle token expiration
  if (response.status === 401) {
    // Token expired, we'll need to re-authenticate
    throw new Error("Spotify token expired");
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
};

// Get current user profile
export const getUserProfile = async (): Promise<SpotifyUser> => {
  return apiCall("/me", "GET");
};

// Search tracks, albums, and artists
export const search = async (query: string): Promise<SearchResults> => {
  if (!query.trim()) {
    return { tracks: [], albums: [], artists: [] };
  }

  const params = new URLSearchParams({
    q: query,
    type: "track,album,artist",
    limit: "10",
  });

  const data = await apiCall(`/search?${params}`, "GET");

  return {
    tracks: data.tracks?.items || [],
    albums: data.albums?.items || [],
    artists: data.artists?.items || [],
  };
};

// Get track details
export const getTrack = async (trackId: string): Promise<SpotifyTrack> => {
  return apiCall(`/tracks/${trackId}`, "GET");
};

// Get album details
export const getAlbum = async (albumId: string): Promise<SpotifyAlbum> => {
  return apiCall(`/albums/${albumId}`, "GET");
};

// Get artist details
export const getArtist = async (artistId: string): Promise<SpotifyArtist> => {
  return apiCall(`/artists/${artistId}`, "GET");
};

// Get a track's audio features
export const getAudioFeatures = async (trackId: string) => {
  return apiCall(`/audio-features/${trackId}`, "GET");
};
