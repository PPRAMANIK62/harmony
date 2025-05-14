import { supabase } from "@/integrations/supabase/client";
import type { PlaybackState, Song } from "@/lib/types";

export const getPlaybackState = async (
  roomId: string
): Promise<PlaybackState | null> => {
  try {
    // First check if a playback state exists for this room
    const { data, error } = await supabase
      .from("playback_states")
      .select("*")
      .eq("room_id", roomId);

    // Handle the case where no rows are returned
    if (error) {
      console.error(`Error getting playback state for room ${roomId}:`, error);
      return null;
    }

    // If no playback state exists yet, return null
    if (!data || data.length === 0) {
      return null;
    }

    // Return the first playback state (there should only be one per room)
    return data[0];
  } catch (error) {
    console.error(`Error getting playback state for room ${roomId}:`, error);
    return null;
  }
};

export const updatePlaybackState = async (
  roomId: string,
  is_playing: boolean,
  current_position: number,
  songId: string | null
): Promise<PlaybackState | null> => {
  try {
    const updates = {
      room_id: roomId,
      is_playing,
      current_position,
      updated_at: new Date().toISOString(),
      current_song_id: songId,
    };

    // Use upsert to create a new record if one doesn't exist
    const { data, error } = await supabase
      .from("playback_states")
      .upsert(updates)
      .select();

    if (error) {
      console.error(`Error updating playback state for room ${roomId}:`, error);
      return null;
    }

    // Return the first result (there should only be one)
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error updating playback state for room ${roomId}:`, error);
    return null;
  }
};

export const subscribeToPlaybackState = (
  roomId: string,
  callback: (state: PlaybackState) => void
) => {
  const channel = supabase
    .channel(`playback-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "playback_states",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        callback(payload.new as PlaybackState);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getCurrentSong = async (roomId: string): Promise<Song | null> => {
  try {
    const { data, error } = await supabase
      .from("playback_states")
      .select(
        `
        current_song_id,
        songs:current_song_id (*)
      `
      )
      .eq("room_id", roomId);

    // Handle the case where no rows are returned
    if (error) {
      console.error(`Error getting current song for room ${roomId}:`, error);
      return null;
    }

    // If no playback state exists yet, return null
    if (!data || data.length === 0 || !data[0].current_song_id) {
      return null;
    }

    // Return the song data from the first playback state
    return data[0].songs || null;
  } catch (error) {
    console.error(`Error getting current song for room ${roomId}:`, error);
    return null;
  }
};
