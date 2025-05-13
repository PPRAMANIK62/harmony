import RoomHeader from "@/components/room-header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import type { Room } from "@/lib/types";
import { getRoom, getRooms, joinRoom } from "@/services/rooms";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  // const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  // const [messages, setMessages] = useState<Message[]>([]);
  // const [members, setMembers] = useState<Profile[]>([]);
  // const [playbackState, setPlaybackState] = useState<ClientPlaybackState>({
  //   isPlaying: false,
  //   currentTime: 0,
  //   volume: 0.8,
  // });
  // const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);

  // Dialog states
  // const [addSongOpen, setAddSongOpen] = useState(false);
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
          {/* <Playlist
            playlist={{
              roomId: roomId || "",
              songs: playlist.map((item) => ({
                id: item.song_id,
                title: item.song?.title || "Unknown",
                artist: item.song?.artist,
                duration: item.song?.duration || 0,
                thumbnail: item.song?.thumbnail,
                added_by: item.song?.added_by || "",
                youtube_id: item.song?.youtube_id || "",
                created_at: item.song?.created_at || new Date().toISOString(),
              })),
              currentSongIndex,
            }}
            onPlaySong={handlePlaySong}
            onAddSong={() => setAddSongOpen(true)}
          /> */}

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

      {/* <AddSongDialog
        open={addSongOpen}
        onOpenChange={setAddSongOpen}
        onAddSong={handleAddSong}
      /> */}

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
