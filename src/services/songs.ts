import { supabase } from "@/integrations/supabase/client";
import type { DbPlaylistSongInsert, DbSongInsert } from "@/lib/database-types";
import type { Song } from "@/lib/types";
import type { SpotifyTrack } from "./spotify";

interface PlaylistResponse {
  song: Song | null;
  error: string | null;
}

export const addSongToRoom = async (
  roomId: string,
  trackData: SpotifyTrack
): Promise<PlaylistResponse> => {
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

    // Check if song already exists
    const { data: existingSong } = await supabase
      .from("songs")
      .select()
      .eq("spotify_id", trackData.id)
      .single();

    let song = existingSong;

    if (!existingSong) {
      // Create new song if it doesn't exist
      const songData: DbSongInsert = {
        title: trackData.name,
        artist: trackData.artists.map((a) => a.name).join(", "),
        duration: Math.round(trackData.duration_ms / 1000),
        thumbnail: trackData.album.images[0]?.url || null,
        spotify_id: trackData.id,
        spotify_uri: trackData.uri,
        added_by: userData.user.id,
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

      song = newSong;
    }

    if (!song) {
      return {
        song: null,
        error: "Failed to create or retrieve song",
      };
    }

    // Get or create playlist for the room
    let playlist;
    const { data: existingPlaylist, error: playlistError } = await supabase
      .from("playlists")
      .select("id")
      .eq("room_id", roomId)
      .single();

    if (playlistError && playlistError.code === "PGRST116") {
      // Playlist doesn't exist, create it
      const { data: newPlaylist, error: createPlaylistError } = await supabase
        .from("playlists")
        .insert({ room_id: roomId })
        .select()
        .single();

      if (createPlaylistError || !newPlaylist) {
        return {
          song: null,
          error: `Failed to create playlist: ${createPlaylistError?.message || "Unknown error"}`,
        };
      }

      playlist = newPlaylist;
    } else if (playlistError) {
      return {
        song: null,
        error: `Failed to get playlist: ${playlistError.message}`,
      };
    } else {
      playlist = existingPlaylist;
    }

    if (!playlist) {
      return {
        song: null,
        error: "Failed to create or retrieve playlist",
      };
    }

    // Check if song is already in playlist
    const { data: existingPlaylistSong } = await supabase
      .from("playlists_songs")
      .select()
      .eq("playlist_id", playlist.id)
      .eq("song_id", song.id)
      .single();

    if (existingPlaylistSong) {
      return {
        song: null,
        error: "This song is already in the playlist",
      };
    }

    // Get the current playlist length to determine order using a transaction
    const { data: playlistItems, error: playlistSongError } = await supabase
      .from("playlists_songs")
      .select("order")
      .eq("playlist_id", playlist.id)
      .order("order", { ascending: false })
      .limit(1);

    if (playlistSongError) {
      return {
        song: null,
        error: "Failed to get playlist order",
      };
    }

    const order =
      playlistItems && playlistItems.length > 0
        ? (playlistItems[0].order || 0) + 1
        : 0;

    // Add the song to the playlist
    const playlistSongData: DbPlaylistSongInsert = {
      playlist_id: playlist.id,
      song_id: song.id,
      order: order,
    };

    const { error: playlistInsertError } = await supabase
      .from("playlists_songs")
      .insert(playlistSongData);

    if (playlistInsertError) {
      return {
        song: null,
        error: `Failed to add song to playlist: ${playlistInsertError.message}`,
      };
    }

    return { song, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error adding song to room:", errorMessage);
    return { song: null, error: errorMessage };
  }
};

export const getPlaylist = async (roomId: string): Promise<Song[]> => {
  try {
    if (!roomId?.trim()) {
      console.error("Invalid room ID provided");
      return [];
    }

    // First check if a playlist exists for this room
    const { data: playlistData, error: playlistError } = await supabase
      .from("playlists")
      .select("id")
      .eq("room_id", roomId)
      .single();

    if (playlistError) {
      if (playlistError.code === "PGRST116") {
        // No playlist exists yet, return empty array
        return [];
      }
      console.error("Error fetching playlist:", playlistError.message);
      return [];
    }

    // If no playlist exists yet, return empty array
    if (!playlistData) {
      return [];
    }

    // Get the songs in the playlist
    const { data, error } = await supabase
      .from("playlists_songs")
      .select(
        `
        id,
        order,
        created_at,
        songs:song_id(*)
      `
      )
      .eq("playlist_id", playlistData.id)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching playlist songs:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the data to match the expected format
    return data
      .filter((item) => item.songs !== null)
      .map((item) => ({ ...item.songs }) as Song);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error fetching playlist:", errorMessage);
    return [];
  }
};
