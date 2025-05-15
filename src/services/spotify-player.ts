import { getSessionToken } from "./spotify";

// Define types for the Spotify Web Playback SDK
declare global {
  interface Window {
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume?: number;
}

export interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (state: any) => void) => void;
  removeListener: (event: string, callback?: (state: any) => void) => void;
  getCurrentState: () => Promise<SpotifyPlaybackState | null>;
  setName: (name: string) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

export interface SpotifyPlaybackState {
  context: {
    uri: string;
    metadata: Record<string, unknown>;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

export interface SpotifyTrackMetadata {
  uri: string;
  id: string;
  type: string;
  media_type: string;
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: { url: string }[];
  };
  artists: {
    uri: string;
    name: string;
  }[];
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  type: string;
  media_type: string;
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: { url: string }[];
  };
  artists: {
    uri: string;
    name: string;
  }[];
}

// Singleton instance of the player
let playerInstance: SpotifyPlayer | null = null;
let deviceId: string | null = null;

// Load the Spotify Web Playback SDK script
export const loadSpotifyScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If the script is already loaded, resolve immediately
    if (window.Spotify) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    // Set up callbacks
    script.onload = () => resolve();
    script.onerror = (error) => reject(new Error(`Failed to load Spotify SDK: ${error}`));

    // Add the script to the document
    document.body.appendChild(script);
  });
};

// Initialize the Spotify Web Playback SDK
export const initializePlayer = async (
  playerName: string = "Harmony Web Player"
): Promise<SpotifyPlayer | null> => {
  try {
    // Load the Spotify script if it's not already loaded
    await loadSpotifyScript();

    // Wait for the SDK to be ready
    await new Promise<void>((resolve) => {
      if (window.Spotify) {
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => resolve();
      }
    });

    // Create a new player instance if one doesn't exist
    if (!playerInstance) {
      playerInstance = new window.Spotify.Player({
        name: playerName,
        getOAuthToken: async (callback) => {
          const token = await getSessionToken();
          if (token) {
            callback(token);
          } else {
            console.error("No Spotify token available");
          }
        },
        volume: 0.5,
      });

      // Error handling
      playerInstance.addListener("initialization_error", ({ message }) => {
        console.error("Spotify Player initialization error:", message);
      });

      playerInstance.addListener("authentication_error", ({ message }) => {
        console.error("Spotify Player authentication error:", message);
      });

      playerInstance.addListener("account_error", ({ message }) => {
        console.error("Spotify Player account error:", message);
      });

      playerInstance.addListener("playback_error", ({ message }) => {
        console.error("Spotify Player playback error:", message);
      });

      // Ready event
      playerInstance.addListener("ready", ({ device_id }) => {
        console.log("Spotify Player ready with device ID:", device_id);
        deviceId = device_id;
      });

      // Not ready event
      playerInstance.addListener("not_ready", ({ device_id }) => {
        console.log("Spotify Player device has gone offline:", device_id);
        deviceId = null;
      });

      // Connect to the player
      const connected = await playerInstance.connect();
      if (!connected) {
        console.error("Failed to connect to Spotify Player");
        return null;
      }
    }

    return playerInstance;
  } catch (error) {
    console.error("Error initializing Spotify Player:", error);
    return null;
  }
};

// Play a specific track
export const playTrack = async (uri: string): Promise<boolean> => {
  try {
    if (!deviceId) {
      console.error("No device ID available");
      return false;
    }

    const token = await getSessionToken();
    if (!token) {
      console.error("No Spotify token available");
      return false;
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [uri],
      }),
    });

    if (!response.ok) {
      // If the response is 204 No Content, it's actually successful
      if (response.status !== 204) {
        console.error("Failed to play track:", await response.text());
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error playing track:", error);
    return false;
  }
};

// Get the current player
export const getPlayer = (): SpotifyPlayer | null => {
  return playerInstance;
};

// Get the current device ID
export const getDeviceId = (): string | null => {
  return deviceId;
};

// Clean up the player
export const cleanupPlayer = (): void => {
  if (playerInstance) {
    playerInstance.disconnect();
    playerInstance = null;
    deviceId = null;
  }
};
