import type { Playlist } from "@/lib/types";
import { Plus } from "lucide-react";
import PlaylistItem from "./playlist-item";
import { Button } from "./ui/button";

type Props = {
  playlist?: Playlist;
  onPlaySong: (index: number) => void;
  onAddSong: () => void;
};

const PLaylist = ({ playlist, onAddSong, onPlaySong }: Props) => {
  if (!playlist) {
    return (
      <div className="p-4 flex-1 flex flex-col items-center justify-center">
        <p className="text-harmony-gray mb-4">No playlist available</p>
        <Button onClick={onAddSong}>
          <Plus className="mr-2 h-4 w-4" />
          Add Songs
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Playlist</h2>
        <Button size="sm" onClick={onAddSong}>
          <Plus className="mr-2 h-4 w-4" />
          Add Song
        </Button>
      </div>

      <div className="space-y-1">
        {playlist.songs.length > 0 ? (
          playlist.songs.map((song, index) => (
            <PlaylistItem
              key={song.id}
              song={song}
              isActive={index === playlist.currentSongIndex}
              onPlay={() => onPlaySong(index)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-harmony-gray mb-4">Playlist is empty</p>
            <Button onClick={onAddSong}>
              <Plus className="mr-2 h-4 w-4" />
              Add Song
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLaylist;
