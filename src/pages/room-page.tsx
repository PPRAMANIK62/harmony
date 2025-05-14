import AddSongDialog from "@/components/add-song-dialog";
import PlaylistComponent from "@/components/playlist";
import RoomHeader from "@/components/room-header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import type { Profile, Room, Song } from "@/lib/types";
import { getRoom, getRoomMembers, getRooms, joinRoom } from "@/services/rooms";
import { addSongToRoom, getPlaylist } from "@/services/songs";
import type { SpotifyTrack } from "@/services/spotify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  // const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  // const [playbackState, setPlaybackState] = useState<ClientPlaybackState>({
  //   isPlaying: false,
  //   currentTime: 0,
  //   volume: 0.8,
  // });
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);

  // Dialog states
  const [addSongOpen, setAddSongOpen] = useState(false);
  const [shareRoomOpen, setShareRoomOpen] = useState(false);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);

  // const audioRef = useRef<HTMLAudioElement | null>(null);
  // const timerRef = useRef<number | null>(null);
  // const isSyncingRef = useRef<boolean>(false);

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

        // Load playlist
        const playlistData = await getPlaylist(roomId);
        setPlaylist(playlistData);

        // Load room members
        const { members: membersData, error: membersError } =
          await getRoomMembers(roomId);
        if (membersError) {
          toast.error(membersError);
          return;
        }
        setMembers(membersData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load room data");
      }
    };

    loadInitialData();
  }, [roomId, user, navigate]);

  const handleShareRoom = () => {
    setShareRoomOpen(true);
  };

  const handleAddSong = async (trackData: SpotifyTrack) => {
    if (!roomId) return;

    try {
      const result = await addSongToRoom(roomId, trackData);
      if (result.song) {
        // Refresh the playlist
        const playlistData = await getPlaylist(roomId);
        setPlaylist(playlistData || []);

        toast.success(`Added "${result.song.title}" to the playlist`);

        // Send a message to the chat
        // await sendMessage(
        //   roomId,
        //   `Added "${result.song.title}" to the playlist`
        // );
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        throw new Error("Failed to add song");
      }
    } catch (error) {
      console.error("Error adding song:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add song"
      );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar rooms={rooms} onCreateRoom={() => setCreateRoomOpen(true)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10">
          <RoomHeader room={currentRoom} onShareRoom={handleShareRoom} />
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <PlaylistComponent
            playlist={{
              id: "",
              room_id: roomId || "",
              created_at: null,
              updated_at: null,
              current_playing: null,
              songs: playlist.map((item) => ({
                id: item.id,
                title: item.title || "Unknown",
                artist: item.artist,
                duration: item.duration || 0,
                thumbnail: item.thumbnail,
                spotify_id: item.spotify_id,
                spotify_uri: item.spotify_uri,
                added_by: item.added_by || "",
                created_at: item.created_at || new Date().toISOString(),
                playlist_position: item.playlist_position,
                playlist_current_position: item.playlist_current_position || 0,
              })),
              currentSongIndex,
            }}
            onPlaySong={() => {}}
            onAddSong={() => setAddSongOpen(true)}
          />

          {/* <ChatPanel messages={messages} onSendMessage={handleSendMessage} /> */}
        </div>

        {/* Music Player */}
        {/* <MusicPlayer
          currentSong={
            currentSong
              ? {
                  id: currentSong.id,
                  title: currentSong.title,
                  artist: currentSong.artist,
                  duration: currentSong.duration,
                  thumbnail: currentSong.thumbnail,
                  added_by: currentSong.added_by,
                  youtube_id: currentSong.youtube_id,
                  created_at: currentSong.created_at,
                }
              : null
          }
          playbackState={playbackState}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        /> */}
      </div>

      <AddSongDialog
        open={addSongOpen}
        onOpenChange={setAddSongOpen}
        onAddSong={handleAddSong}
      />

      {/* <ShareRoomDialog
        open={shareRoomOpen}
        onOpenChange={setShareRoomOpen}
        room={currentRoom}
      /> */}

      {/* <CreateRoomDialog
        open={createRoomOpen}
        onOpenChange={setCreateRoomOpen}
        onCreateRoom={handleCreateRoom}
      /> */}
    </div>
  );
};

export default RoomPage;
