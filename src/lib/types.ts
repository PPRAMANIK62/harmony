import type {
  DbMessage,
  DbPlaybackState,
  DbProfile,
  DbRoom,
  DbRoomMember,
  DbQueue,
  DbSong,
} from "./database-types";

/**
 * User interface representing a user in the application.
 * This is a client-side representation, not directly mapped to a database table.
 */
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

/**
 * Room interface that maps to the rooms table in the database.
 */
export interface Room extends DbRoom {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_by: string;
  is_private: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * RoomMember interface that maps to the room_members table in the database.
 */
export interface RoomMember extends DbRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

/**
 * Song interface that maps to the songs table in the database.
 * Includes additional fields for when a song is part of a queue.
 */
export interface Song extends DbSong {
  id: string;
  title: string;
  artist: string | null;
  duration: number; // in seconds
  thumbnail: string | null;
  spotify_id: string | null; // For Spotify tracks
  spotify_uri: string | null; // For Spotify tracks
  created_at: string;
  // Client-side properties (not in database)
  queue_position?: number;
  queue_id?: number;
  added_by?: string;
}

/**
 * Queue interface that maps to the queues table in the database.
 */
export interface Queue extends DbQueue {
  id: number;
  room_id: string | null;
  song_id: string | null;
  order: number | null;
  played_at: string;
  aded_by: string | null;
}

/**
 * Message interface that maps to the messages table in the database.
 */
export interface Message extends DbMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Join with profiles for these fields
  user_name?: string;
  user_avatar?: string;
}

/**
 * PlaybackState interface that maps to the playback_states table in the database.
 */
export interface PlaybackState extends DbPlaybackState {
  room_id: string;
  current_song_id: string | null;
  is_playing: boolean | null;
  current_position: number | null;
  updated_at: string;
}

/**
 * Client-side playback state for the music player.
 * Not directly mapped to a database table.
 */
export interface ClientPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
}

/**
 * Profile interface that maps to the profiles table in the database.
 */
export interface Profile extends DbProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
