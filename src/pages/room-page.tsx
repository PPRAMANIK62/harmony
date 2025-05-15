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
import * as SpotifyPlayer from "@/services/spotify-player";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isSpotifyConnected } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playbackState, setPlaybackState] = useState<ClientPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    volume: 0.8,
  });
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerState, setPlayerState] =
    useState<SpotifyPlayer.SpotifyPlaybackState | null>(null);

  // Dialog states
  const [addSongOpen, setAddSongOpen] = useState(false);

  const timerRef = useRef<number | null>(null);
  const playerStateRef = useRef<SpotifyPlayer.SpotifyPlaybackState | null>(
    null
  );

  // Initialize Spotify Web Player
  useEffect(() => {
    if (!isSpotifyConnected) {
      toast.error("Please connect to Spotify to use the player");
      return;
    }

    const initPlayer = async () => {
      try {
        const player =
          await SpotifyPlayer.initializePlayer("Harmony Web Player");

        if (!player) {
          toast.error("Failed to initialize Spotify player");
          return;
        }

        // Set up player state listener
        player.addListener("player_state_changed", (state) => {
          if (state) {
            setPlayerState(state);
            playerStateRef.current = state;

            // Update our client playback state
            setPlaybackState((prev) => ({
              ...prev,
              isPlaying: !state.paused,
              currentTime: Math.floor(state.position / 1000), // Convert ms to seconds
            }));
          }
        });

        // Set up ready listener
        player.addListener("ready", ({ device_id }) => {
          console.log("Spotify Player ready with device ID:", device_id);
          setPlayerReady(true);
          toast.success("Spotify player connected");
        });

        // Set up not ready listener
        player.addListener("not_ready", ({ device_id }) => {
          console.log("Spotify Player device has gone offline:", device_id);
          setPlayerReady(false);
          toast.error("Spotify player disconnected");
        });

        // Clean up on unmount
        return () => {
          SpotifyPlayer.cleanupPlayer();
        };
      } catch (error) {
        console.error("Error initializing Spotify player:", error);
        toast.error("Failed to initialize Spotify player");
      }
    };

    initPlayer();
  }, [isSpotifyConnected]);

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
    if (songs.length === 0 || !playerReady) return;

    // Use Spotify SDK to go to next track
    const player = SpotifyPlayer.getPlayer();
    if (player) {
      player.nextTrack().catch((error) => {
        console.error("Error going to next track:", error);
        toast.error("Failed to go to next track");
      });
    } else {
      // Fallback to our own implementation if player is not available
      const nextIndex = (currentSongIndex + 1) % songs.length;
      setCurrentSongIndex(nextIndex);

      // Update playback state in the database
      if (roomId && songs[nextIndex]) {
        updatePlaybackState(roomId, true, 0, songs[nextIndex].id);
      }
    }
  }, [songs, currentSongIndex, roomId, playerReady]);

  // Play song when currentSongIndex changes
  useEffect(() => {
    if (
      songs?.length === 0 ||
      currentSongIndex < 0 ||
      !songs[currentSongIndex]?.spotify_uri ||
      !playerReady
    ) {
      return;
    }

    const currentSong = songs[currentSongIndex];
    if (!currentSong) return;

    // Play the track using Spotify Web Player SDK
    const playSong = async () => {
      try {
        if (!currentSong.spotify_uri) {
          toast.error("No Spotify URI available for this song");
          return;
        }

        const success = await SpotifyPlayer.playTrack(currentSong.spotify_uri);
        if (!success) {
          toast.error("Failed to play track");
        } else {
          // Update playback state in the database
          if (roomId) {
            updatePlaybackState(roomId, true, 0, currentSong.id);
          }
        }
      } catch (error) {
        console.error("Error playing track:", error);
        toast.error("Failed to play track");
      }
    };

    playSong();
  }, [songs, currentSongIndex, playerReady, roomId]);

  const handlePrevious = useCallback(() => {
    if (songs.length === 0 || !playerReady) return;

    // Use Spotify SDK to go to previous track
    const player = SpotifyPlayer.getPlayer();
    if (player) {
      player.previousTrack().catch((error) => {
        console.error("Error going to previous track:", error);
        toast.error("Failed to go to previous track");
      });
    } else {
      // Fallback to our own implementation if player is not available
      const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      setCurrentSongIndex(prevIndex);

      // Update playback state in the database
      if (roomId && songs[prevIndex]) {
        updatePlaybackState(roomId, true, 0, songs[prevIndex].id);
      }
    }
  }, [songs, currentSongIndex, roomId, playerReady]);

  const handlePlayPause = useCallback(() => {
    if (!playerReady) return;

    const newIsPlaying = !playbackState.isPlaying;
    const player = SpotifyPlayer.getPlayer();

    if (player) {
      if (newIsPlaying) {
        player.resume().catch((error) => {
          console.error("Error resuming playback:", error);
          toast.error("Failed to resume playback");
        });
      } else {
        player.pause().catch((error) => {
          console.error("Error pausing playback:", error);
          toast.error("Failed to pause playback");
        });
      }

      // Update UI state immediately for better responsiveness
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: newIsPlaying,
      }));

      // Update playback state in the database
      if (roomId && currentSongIndex >= 0 && songs[currentSongIndex]) {
        const currentTime = playerStateRef.current
          ? Math.floor(playerStateRef.current.position / 1000)
          : 0;

        updatePlaybackState(
          roomId,
          newIsPlaying,
          currentTime,
          songs[currentSongIndex].id
        );
      }
    }
  }, [playbackState.isPlaying, roomId, currentSongIndex, songs, playerReady]);

  const handleSeek = useCallback(
    (time: number) => {
      if (!playerReady) return;

      const player = SpotifyPlayer.getPlayer();
      if (player) {
        // Convert seconds to milliseconds for Spotify SDK
        const position_ms = time * 1000;

        player.seek(position_ms).catch((error) => {
          console.error("Error seeking:", error);
          toast.error("Failed to seek");
        });

        // Update UI state immediately for better responsiveness
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
    [roomId, currentSongIndex, songs, playbackState.isPlaying, playerReady]
  );

  const handleVolumeChange = useCallback(
    (volume: number) => {
      if (!playerReady) return;

      const player = SpotifyPlayer.getPlayer();
      if (player) {
        player.setVolume(volume).catch((error) => {
          console.error("Error setting volume:", error);
          toast.error("Failed to set volume");
        });

        // Update UI state immediately
        setPlaybackState((prev) => ({
          ...prev,
          volume,
        }));
      }
    },
    [playerReady]
  );

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
            onPlaySong={async (index) => {
              if (!playerReady) {
                toast.error("Spotify player is not ready");
                return;
              }

              setCurrentSongIndex(index);

              const song = songs[index];
              if (!song?.spotify_uri) {
                toast.error("No Spotify URI available for this song");
                return;
              }

              try {
                const success = await SpotifyPlayer.playTrack(song.spotify_uri);
                if (success) {
                  if (roomId) {
                    updatePlaybackState(roomId, true, 0, song.id);
                  }

                  setPlaybackState((prev) => ({
                    ...prev,
                    isPlaying: true,
                    currentTime: 0,
                  }));
                } else {
                  toast.error("Failed to play track");
                }
              } catch (error) {
                console.error("Error playing track:", error);
                toast.error("Failed to play track");
              }
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
