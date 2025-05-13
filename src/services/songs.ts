import type { PlaylistItem } from "@/lib/types";

interface PlaylistResponse {
  playlist: PlaylistItem | null;
  error: string | null;
}

// export const addSongToRoom = async (
//   roomId: string,
//   youtubeUrl: string
// ): Promise<PlaylistResponse> => {
//   try {
//   } catch (error) {
//     console.error("Error adding song to room:", error);
//     return null;
//   }
// };
