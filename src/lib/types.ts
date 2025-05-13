export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_by: string;
  is_private: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  duration: number; // in seconds
  thumbnail?: string;
  youtube_id: string;
  added_by: string;
  created_at: string;
}

export interface PlaylistItem {
  id: string;
  room_id: string;
  song_id: string;
  position: number;
  added_at: string;
  // Join with songs table for these fields
  song?: Song;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Join with profiles for these fields
  user_name?: string;
  user_avatar?: string;
}

export interface PlaybackState {
  room_id: string;
  current_song_id: string | null;
  is_playing: boolean;
  current_position: number;
  updated_at: string;
}

// Client-side playback state
export interface ClientPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Define a Playlist type for use in components
export interface Playlist {
  roomId: string;
  songs: Array<Song>;
  currentSongIndex: number;
}
