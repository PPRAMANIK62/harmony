import { supabase } from "@/integrations/supabase/client";
import type { DbQueueInsert } from "@/lib/database-types";
import type { Song } from "@/lib/types";
import { createOrGetSong } from "./songs";
import type { SpotifyTrack } from "./spotify";

interface QueueResponse {
  song: Song | null;
  error: string | null;
}

/**
 * Add a song to a room's queue
 */
export const addSongToQueue = async (
  roomId: string,
  trackData: SpotifyTrack
): Promise<QueueResponse> => {
  try {
    // Input validation
    if (!roomId?.trim()) {
      return { song: null, error: "Room ID is required" };
    }

    if (!trackData) {
      return { song: null, error: "Track data is required" };
    }

    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { song: null, error: "Authentication required" };
    }

    // Create or get the song
    const { song, error: songError } = await createOrGetSong(trackData);

    if (songError || !song) {
      return {
        song: null,
        error: songError || "Failed to create or retrieve song",
      };
    }

    // Get the highest order in the queue
    const { data: queueItems } = await supabase
      .from("queues")
      .select("order")
      .eq("room_id", roomId)
      .order("order", { ascending: false })
      .limit(1);

    const order =
      queueItems && queueItems.length > 0 ? (queueItems[0].order || 0) + 1 : 0;

    // Add the song to the queue
    const queueData: DbQueueInsert = {
      room_id: roomId,
      song_id: song.id,
      order: order,
      // Fix the typo in the field name (aded_by -> added_by)
      // Check the actual field name in the database schema
      aded_by: userData.user.id, // Keep this as is if the DB field is actually named "aded_by"
      played_at: new Date().toISOString(),
    };

    const { error: queueInsertError } = await supabase
      .from("queues")
      .insert(queueData);

    if (queueInsertError) {
      return {
        song: null,
        error: `Failed to add song to queue: ${queueInsertError.message}`,
      };
    }

    return {
      song: {
        ...song,
        added_by: userData.user.id,
        queue_position: order,
        queue_id: 0, // This will be updated when fetching from the database
      },
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error adding song to queue:", errorMessage);
    return { song: null, error: errorMessage };
  }
};

/**
 * Get all songs in a room's queue
 */
export const getQueueSongs = async (roomId: string): Promise<Song[]> => {
  try {
    if (!roomId?.trim()) {
      console.error("Invalid room ID provided");
      return [];
    }

    // Get all songs in the queue for this room
    const { data: queueData, error: queueError } = await supabase
      .from("queues")
      .select(
        `
        *,
        song:song_id(*)
      `
      )
      .eq("room_id", roomId)
      .order("order", { ascending: true });

    if (queueError) {
      console.error("Error fetching queue:", queueError.message);
      return [];
    }

    if (!queueData || queueData.length === 0) {
      return [];
    }

    // Transform the data to match the Song interface
    return queueData
      .filter((item) => item.song !== null) // Filter out any null songs
      .map((item) => {
        // Type assertion to avoid null checks
        const songData = item.song as {
          id: string;
          title: string;
          artist: string | null;
          duration: number;
          thumbnail: string | null;
          spotify_id: string | null;
          spotify_uri: string | null;
          created_at: string;
        };

        // Ensure all required fields are present
        if (
          !songData?.id ||
          !songData?.title ||
          !songData?.created_at ||
          !songData?.duration
        ) {
          console.error("Invalid song data:", songData);
          return null;
        }

        return {
          id: songData.id,
          title: songData.title,
          artist: songData.artist,
          duration: songData.duration,
          thumbnail: songData.thumbnail,
          spotify_id: songData.spotify_id,
          spotify_uri: songData.spotify_uri,
          created_at: songData.created_at,
          // Client-side properties
          queue_id: item.id,
          queue_position: item.order,
          added_by: item.aded_by,
        } as Song;
      })
      .filter((song): song is Song => song !== null); // Type guard to filter out nulls
  } catch (error) {
    console.error("Error getting queue songs:", error);
    return [];
  }
};

/**
 * Update the playback state for a room
 * @param roomId The ID of the room
 * @param isPlaying Whether playback is currently active
 * @param currentPosition The current playback position in seconds
 * @param songId The ID of the current song
 * @returns A boolean indicating success or failure
 */
export const updatePlaybackState = async (
  roomId: string,
  isPlaying: boolean,
  currentPosition: number,
  songId: string | null
): Promise<boolean> => {
  try {
    const updates = {
      room_id: roomId,
      is_playing: isPlaying,
      current_position: currentPosition,
      current_song_id: songId,
      updated_at: new Date().toISOString(),
    };

    // Use upsert to create a new record if one doesn't exist
    const { error } = await supabase.from("playback_states").upsert(updates);

    if (error) {
      console.error(`Error updating playback state for room ${roomId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating playback state for room ${roomId}:`, error);
    return false;
  }
};
