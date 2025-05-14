import { supabase } from "@/integrations/supabase/client";
import type { DbSongInsert } from "@/lib/database-types";
import type { Song } from "@/lib/types";
import type { SpotifyTrack } from "./spotify";

interface SongResponse {
  song: Song | null;
  error: string | null;
}

/**
 * Create or retrieve a song from the database
 */
export const createOrGetSong = async (
  trackData: SpotifyTrack
): Promise<SongResponse> => {
  try {
    if (!trackData) {
      return { song: null, error: "Track data is required" };
    }

    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { song: null, error: "Authentication required" };
    }

    // Check if song already exists
    const { data: existingSong } = await supabase
      .from("songs")
      .select()
      .eq("spotify_id", trackData.id)
      .single();

    if (existingSong) {
      return { song: existingSong, error: null };
    }

    // Create new song if it doesn't exist
    const songData: DbSongInsert = {
      title: trackData.name,
      artist: trackData.artists.map((a) => a.name).join(", "),
      duration: Math.round(trackData.duration_ms / 1000),
      thumbnail: trackData.album.images[0]?.url || null,
      spotify_id: trackData.id,
      spotify_uri: trackData.uri,
    };

    const { data: newSong, error: songError } = await supabase
      .from("songs")
      .insert(songData)
      .select()
      .single();

    if (songError || !newSong) {
      return {
        song: null,
        error: `Failed to create song: ${songError?.message || "Unknown error"}`,
      };
    }

    return { song: newSong, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creating or getting song:", errorMessage);
    return { song: null, error: errorMessage };
  }
};
