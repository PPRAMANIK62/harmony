import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  song: Song;
  isActive?: boolean;
  onPlay: () => void;
};

const PlaylistItem = ({ onPlay, song, isActive }: Props) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className={cn(
        "flex items-center p-2 rounded-md transition-colors cursor-pointer hover:bg-white/5",
        isActive && "bg-harmony-primary/20"
      )}
      onClick={onPlay}
    >
      <div className="w-10 h-10 rounded bg-gray-800 relative overflow-hidden flex-shrink-0">
        {song.thumbnail ? (
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-harmony-secondary">
            <span className="text-xs">♪</span>
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="equalizer-bars">
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
            </div>
          </div>
        )}
      </div>

      <div className="ml-3 flex-grow min-w-0">
        <h3
          className={cn(
            "text-sm font-medium truncate",
            isActive && "text-harmony-primary"
          )}
        >
          {song.title}
        </h3>
        {song.artist && (
          <p className="text-xs text-harmony-gray truncate">{song.artist}</p>
        )}
      </div>

      <div className="ml-2 text-xs text-harmony-gray">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
};

export default PlaylistItem;
