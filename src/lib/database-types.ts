/**
 * This file provides type mappings between the Supabase database schema and the application types.
 * It helps ensure type safety when working with database operations.
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Re-export the database types for convenience
export type { Database, Tables, TablesInsert, TablesUpdate };

// Define type aliases for each table's Row type
export type DbMessage = Tables<"messages">;
export type DbPlaybackState = Tables<"playback_states">;
export type DbPlaylist = Tables<"playlists">;
export type DbPlaylistSong = Tables<"playlists_songs">;
export type DbProfile = Tables<"profiles">;
export type DbRoomMember = Tables<"room_members">;
export type DbRoom = Tables<"rooms">;
export type DbSong = Tables<"songs">;

// Define type aliases for each table's Insert type
export type DbMessageInsert = TablesInsert<"messages">;
export type DbPlaybackStateInsert = TablesInsert<"playback_states">;
export type DbPlaylistInsert = TablesInsert<"playlists">;
export type DbPlaylistSongInsert = TablesInsert<"playlists_songs">;
export type DbProfileInsert = TablesInsert<"profiles">;
export type DbRoomMemberInsert = TablesInsert<"room_members">;
export type DbRoomInsert = TablesInsert<"rooms">;
export type DbSongInsert = TablesInsert<"songs">;

// Define type aliases for each table's Update type
export type DbMessageUpdate = TablesUpdate<"messages">;
export type DbPlaybackStateUpdate = TablesUpdate<"playback_states">;
export type DbPlaylistUpdate = TablesUpdate<"playlists">;
export type DbPlaylistSongUpdate = TablesUpdate<"playlists_songs">;
export type DbProfileUpdate = TablesUpdate<"profiles">;
export type DbRoomMemberUpdate = TablesUpdate<"room_members">;
export type DbRoomUpdate = TablesUpdate<"rooms">;
export type DbSongUpdate = TablesUpdate<"songs">;
