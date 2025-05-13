import type { Room } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./logo";
import { Button } from "./ui/button";

type Props = {
  rooms: Room[];
  onCreateRoom: () => void;
};

const Sidebar = ({ onCreateRoom, rooms }: Props) => {
  const location = useLocation();

  return (
    <div className="h-full w-64 border-r border-white/10 flex flex-col">
      <div className="p-4">
        <Logo />
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-harmony-gray">
            YOUR ROOMS
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCreateRoom}
            className="h-6 w-6 text-harmony-gray hover:text-white hover:bg-harmony-primary/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-1">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/room/${room.id}`}
              className={cn(
                "sidebar-item",
                location.pathname === `/room/${room.id}` && "active"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-harmony-secondary flex items-center justify-center">
                {room.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{room.name}</span>
            </Link>
          ))}

          {rooms.length === 0 && (
            <div className="text-harmony-gray text-sm p-2 text-center">
              No rooms yet. Create one to get started.
            </div>
          )}
        </nav>
      </div>

      <div className="p-3 border-t border-white/10">
        <Button
          variant="outline"
          className="w-full bg-harmony-primary bg-opacity-10 border-harmony-primary/20 hover:bg-harmony-primary/20"
          onClick={onCreateRoom}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Room
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
