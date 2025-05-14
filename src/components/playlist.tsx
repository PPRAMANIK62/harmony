import type { Song } from "@/lib/types";
import { Plus } from "lucide-react";
import PlaylistItem from "./playlist-item";
import { Button } from "./ui/button";

// Queue type with client-side properties
interface QueueData {
  songs: Song[];
  currentSongIndex?: number;
}

type Props = {
  queue?: QueueData;
  onPlaySong: (index: number) => void;
  onAddSong: () => void;
};

const PlaylistComponent = ({ queue, onAddSong, onPlaySong }: Props) => {
  if (!queue) {
    return (
      <div className="p-4 flex-1 flex flex-col items-center justify-center">
        <p className="text-harmony-gray mb-4">No queue available</p>
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
        <h2 className="text-xl font-semibold">Queue</h2>
        <Button size="sm" onClick={onAddSong}>
          <Plus className="mr-2 h-4 w-4" />
          Add Song
        </Button>
      </div>

      <div className="space-y-1">
        {queue.songs && queue.songs.length > 0 ? (
          queue.songs.map((song, index) => (
            <PlaylistItem
              key={`${song.id}-${song.queue_id}`}
              song={song}
              isActive={index === queue.currentSongIndex}
              onPlay={() => onPlaySong(index)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-harmony-gray mb-4">Queue is empty</p>
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

export default PlaylistComponent;
