import { useAuth } from "@/contexts/auth-context";
import type { Room, User } from "@/lib/types";
import { Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import UserProfileButton from "./user-profile-button";

type Props = {
  room: Room | null;
  onShareRoom: () => void;
};

const RoomHeader = ({ room, onShareRoom }: Props) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!room) return null;

  return (
    <div className="p-4 border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-harmony-secondary flex items-center justify-center text-lg font-semibold">
          {room.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{room.name}</h1>
          {room.description && (
            <p className="text-sm text-harmony-gray">{room.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShareRoom}
          className="flex items-center gap-2 hover:bg-harmony-primary/20"
        >
          <Share className="h-4 w-4" />
          Share
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
          onLogin={() => navigate("/")}
          onLogout={signOut}
          onProfile={() => {
            toast.success("Profile feature coming soon");
          }}
        />
      </div>
    </div>
  );
};

export default RoomHeader;
