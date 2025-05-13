import { useAuth } from "@/contexts/auth-context";
import type { Room, User } from "@/lib/types";
import { createRoom, getRooms } from "@/services/rooms";
import { Music, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateRoomDialog from "../components/create-room-dialog";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import UserProfileButton from "../components/user-profile-button";

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error("Failed to load rooms:", error);
        toast.error("Failed to load rooms");
      }
    };

    loadRooms();
  }, []);

  const handleCreateRoom = async (
    name: string,
    description: string,
    isPrivate: boolean
  ) => {
    try {
      const { room: newRoom, error } = await createRoom(
        name,
        description,
        isPrivate
      );
      if (newRoom) {
        toast.success("Room created successfully");
        setCreateDialogOpen(false);
        navigate(`/room/${newRoom?.id}`);
      } else {
        toast.error(error);
        throw new Error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Music Rooms</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-harmony-primary hover:bg-harmony-primary/80"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>

            <UserProfileButton
              user={
                user
                  ? ({
                      id: user.id,
                      name: profile?.username || "User",
                      email: user.email,
                      avatar: profile?.avatar_url,
                    } as User)
                  : null
              }
              onLogin={() => navigate("/auth")}
              onLogout={signOut}
              onProfile={() => navigate("/profile")}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link to={`/room/${room.id}`} key={room.id}>
              <Card className="bg-black/40 border-harmony-primary/20 hover:border-harmony-primary transition-all duration-300 cursor-pointer h-full glass-card shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{room.name}</CardTitle>
                  <CardDescription className="text-harmony-gray">
                    {room.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-harmony-primary/20 flex items-center justify-center">
                    <Music className="h-8 w-8 text-harmony-primary" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-harmony-gray">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {room.is_private ? "Private Room" : "Public Room"}
                    </span>
                  </div>
                  <Button variant="ghost" className="text-harmony-primary">
                    Join
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}

          {rooms.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-harmony-primary/20 flex items-center justify-center mb-4">
                <Music className="h-8 w-8 text-harmony-primary" />
              </div>
              <h2 className="text-xl mb-2 text-white">No rooms yet</h2>
              <p className="text-harmony-gray mb-6">
                Create your first music room to get started
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-harmony-primary hover:bg-harmony-primary/80"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreateRoomDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};

export default Dashboard;
