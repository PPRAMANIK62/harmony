import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AuthDialog = ({ onOpenChange, open }: Props) => {
  const { user, loading, connectSpotify, isSpotifyConnected, spotifyLoading } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state?.from?.pathname as string) || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSpotifyConnect = () => {
    try {
      connectSpotify();
    } catch (error) {
      console.error("Error connecting to Spotify:", error);
      toast.error("Failed to connect to Spotify");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md border-harmony-primary/20 p-0 overflow-hidden">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-harmony-primary/30 to-harmony-accent/30 p-6 relative">
          <div className="absolute top-2 right-2 size-20 rounded-full bg-harmony-primary/10 animate-pulse-light"></div>
          <div
            className="absolute bottom-0 left-4 size-12 rounded-full bg-harmony-accent/10 animate-pulse-light"
            style={{ animationDelay: "1.2s" }}
          ></div>

          <DialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-harmony-primary/20 flex items-center justify-center">
                <Music className="h-6 w-6 text-harmony-primary" />
              </div>
            </div>
            <DialogTitle className="text-2xl">Welcome to Harmony</DialogTitle>
            <DialogDescription className="text-harmony-gray">
              Connect with Spotify to start your musical journey
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center mb-4">
            <p className="text-harmony-gray">
              Harmony uses Spotify to provide you with the best music
              experience. Connect your Spotify account to access your playlists,
              discover new music, and share with friends.
            </p>
          </div>

          <Button
            type="button"
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "bg-[#1DB954] hover:bg-[#1DB954]/90 text-white font-medium"
            )}
            onClick={handleSpotifyConnect}
            disabled={spotifyLoading || isSpotifyConnected}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            {spotifyLoading
              ? "Connecting to Spotify..."
              : isSpotifyConnected
                ? "Connected to Spotify"
                : "Continue with Spotify"}
          </Button>

          <div className="text-center text-sm pt-4">
            <p className="text-harmony-gray text-xs">
              By connecting, you agree to our Terms of Service and Privacy
              Policy. Harmony requires a Spotify account to function properly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
