import type { ClientPlaybackState, Song } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume,
  VolumeOff,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

type Props = {
  currentSong: Song | null;
  playbackState: ClientPlaybackState;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
};

const MusicPlayer = ({
  currentSong,
  onNext,
  onPlayPause,
  onPrevious,
  onSeek,
  onVolumeChange,
  playbackState,
}: Props) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  // const intervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const songDuration = currentSong?.duration || 0;

  const handleSeekChange = (value: number[]) => {
    setSeekPosition(value[0]);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    onSeek(seekPosition);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg border-t border-white/10 p-4 transition-transform duration-300",
        !currentSong && "translate-y-full"
      )}
    >
      <div className="flex items-center max-w-6xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center min-w-0 flex-1">
          {currentSong && (
            <>
              <div className="w-12 h-12 rounded bg-gray-800 mr-3 overflow-hidden flex-shrink-0">
                {currentSong.thumbnail ? (
                  <img
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-harmony-secondary">
                    <span className="text-xs">♪</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 mr-4">
                <h3 className="text-sm font-medium truncate">
                  {currentSong.title}
                </h3>
                {currentSong.artist && (
                  <p className="text-xs text-harmony-gray truncate">
                    {currentSong.artist}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPrevious}
              disabled={!currentSong}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full",
                playbackState.isPlaying ? "bg-harmony-primary text-white" : ""
              )}
              onClick={onPlayPause}
              disabled={!currentSong}
            >
              {playbackState.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onNext}
              disabled={!currentSong}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-harmony-gray w-8">
              {formatTime(seekPosition)}
            </span>
            <Slider
              defaultValue={[0]}
              value={[seekPosition]}
              max={songDuration}
              step={1}
              onValueChange={handleSeekChange}
              onValueCommit={handleSeekEnd}
              onPointerDown={handleSeekStart}
              disabled={!currentSong}
              className="flex-1"
            />
            <span className="text-xs text-harmony-gray w-8">
              {formatTime(songDuration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onVolumeChange(playbackState.volume > 0 ? 0 : 1)}
          >
            {playbackState.volume > 0 ? (
              <Volume className="h-4 w-4" />
            ) : (
              <VolumeOff className="h-4 w-4" />
            )}
          </Button>
          <Slider
            defaultValue={[1]}
            value={[playbackState.volume]}
            max={1}
            step={0.01}
            onValueChange={(value) => onVolumeChange(value[0])}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
