import AddSongDialog from "@/components/add-song-dialog";
import MusicPlayer from "@/components/music-player";
import PlaylistComponent from "@/components/playlist";
import RoomHeader from "@/components/room-header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import type { ClientPlaybackState, Room, Song } from "@/lib/types";
import { getPlaybackState, updatePlaybackState } from "@/services/playback";
import { addSongToQueue, getQueueSongs } from "@/services/queue";
import { getRoom, getRoomMembers, getRooms, joinRoom } from "@/services/rooms";
import type { SpotifyTrack } from "@/services/spotify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playbackState, setPlaybackState] = useState<ClientPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    volume: 0.8,
  });
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);

  // Dialog states
  const [addSongOpen, setAddSongOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const timer = timerRef.current;

    // Clean up audio element on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  // load data on component mount
  useEffect(() => {
    if (!roomId || !user) return;

    const loadInitialData = async () => {
      try {
        const { room: roomData, error } = await getRoom(roomId);
        if (error) {
          toast.error(error);
          navigate("/dashboard");
          return;
        }
        setCurrentRoom(roomData);

        // Join the room
        await joinRoom(roomId);

        // Load rooms for sidebar
        const roomsData = await getRooms();
        setRooms(roomsData);

        // Load queue songs
        const songsData = await getQueueSongs(roomId);
        setSongs(songsData);

        // Load room members
        const { error: membersError } = await getRoomMembers(roomId);
        if (membersError) {
          toast.error(membersError);
          return;
        }
        // We're not using members for now, but we might add this functionality later

        // Load playback state
        const playbackData = await getPlaybackState(roomId);
        if (playbackData && playbackData.current_song_id) {
          // Find the index of the current song in the queue
          const songIndex = songsData.findIndex(
            (song) => song.id === playbackData.current_song_id
          );

          if (songIndex !== -1) {
            setCurrentSongIndex(songIndex);
            setPlaybackState((prev) => ({
              ...prev,
              isPlaying: playbackData.is_playing || false,
              currentTime: playbackData.current_position || 0,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load room data");
      }
    };

    loadInitialData();
  }, [roomId, user, navigate]);

  // Define handleNext with useCallback to avoid dependency issues
  const handleNext = useCallback(() => {
    if (songs.length === 0) return;

    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);

    // Update playback state in the database
    if (roomId && songs[nextIndex]) {
      updatePlaybackState(roomId, true, 0, songs[nextIndex].id);
    }
  }, [songs, currentSongIndex, roomId]);

  // Set up audio player when songs or currentSongIndex changes
  useEffect(() => {
    if (
      songs?.length === 0 ||
      currentSongIndex < 0 ||
      !songs[currentSongIndex]?.spotify_uri
    ) {
      return;
    }

    const currentSong = songs[currentSongIndex];
    if (!currentSong) return;

    if (audioRef.current) {
      // In a real implementation, you would use the Spotify Web Playback SDK
      // or another audio source. For now, we'll just simulate it.
      const audioUrl = `https://example.com/audio/${currentSong.spotify_id}.mp3`;

      audioRef.current.src = audioUrl;
      audioRef.current.volume = playbackState.volume;

      // Set up audio event listeners
      const playAudio = () => {
        if (playbackState.isPlaying) {
          audioRef.current?.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }
      };

      const handleEnded = () => {
        handleNext();
      };

      audioRef.current.addEventListener("canplay", playAudio);
      audioRef.current.addEventListener("ended", handleEnded);

      // Clean up event listeners
      return () => {
        audioRef.current?.removeEventListener("canplay", playAudio);
        audioRef.current?.removeEventListener("ended", handleEnded);
      };
    }
  }, [
    songs,
    currentSongIndex,
    playbackState.isPlaying,
    playbackState.volume,
    handleNext,
  ]);

  const handlePrevious = useCallback(() => {
    if (songs.length === 0) return;

    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);

    // Update playback state in the database
    if (roomId && songs[prevIndex]) {
      updatePlaybackState(roomId, true, 0, songs[prevIndex].id);
    }
  }, [songs, currentSongIndex, roomId]);

  const handlePlayPause = useCallback(() => {
    const newIsPlaying = !playbackState.isPlaying;

    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: newIsPlaying,
    }));

    if (audioRef.current) {
      if (newIsPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }

    // Update playback state in the database
    if (roomId && currentSongIndex >= 0 && songs[currentSongIndex]) {
      updatePlaybackState(
        roomId,
        newIsPlaying,
        audioRef.current?.currentTime || 0,
        songs[currentSongIndex].id
      );
    }
  }, [playbackState.isPlaying, roomId, currentSongIndex, songs]);

  const handleSeek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setPlaybackState((prev) => ({
          ...prev,
          currentTime: time,
        }));

        // Update playback state in the database
        if (roomId && currentSongIndex >= 0 && songs[currentSongIndex]) {
          updatePlaybackState(
            roomId,
            playbackState.isPlaying,
            time,
            songs[currentSongIndex].id
          );
        }
      }
    },
    [roomId, currentSongIndex, songs, playbackState.isPlaying]
  );

  const handleVolumeChange = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setPlaybackState((prev) => ({
        ...prev,
        volume,
      }));
    }
  }, []);

  const handleShareRoom = () => {
    // Implementation for sharing room (could be added later)
    toast.info("Share room functionality will be implemented soon");
  };

  const handleAddSong = async (trackData: SpotifyTrack) => {
    if (!roomId) return;

    try {
      const result = await addSongToQueue(roomId, trackData);
      if (result.song) {
        // Refresh the queue
        const songsData = await getQueueSongs(roomId);
        setSongs(songsData);

        toast.success(`Added "${result.song.title}" to the queue`);
      } else if (result.error) {
        toast.error(result.error);
      } else {
        toast.error("Failed to add song");
      }
    } catch (error) {
      console.error("Error adding song:", error);
      toast.error("Failed to add song");
    }
  };

  const currentSong = currentSongIndex >= 0 ? songs[currentSongIndex] : null;

  return (
    <div className="flex h-screen">
      <Sidebar
        rooms={rooms}
        onCreateRoom={() =>
          toast.info("Create room functionality will be implemented soon")
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10">
          <RoomHeader room={currentRoom} onShareRoom={handleShareRoom} />
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <PlaylistComponent
            queue={{
              songs: songs,
              currentSongIndex,
            }}
            onPlaySong={(index) => {
              setCurrentSongIndex(index);
              if (roomId && songs[index]) {
                updatePlaybackState(roomId, true, 0, songs[index].id);
              }
              setPlaybackState((prev) => ({
                ...prev,
                isPlaying: true,
                currentTime: 0,
              }));
            }}
            onAddSong={() => setAddSongOpen(true)}
          />
        </div>

        {/* Music Player */}
        <MusicPlayer
          currentSong={currentSong}
          playbackState={playbackState}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />
      </div>

      <AddSongDialog
        open={addSongOpen}
        onOpenChange={setAddSongOpen}
        onAddSong={handleAddSong}
      />
    </div>
  );
};

export default RoomPage;
