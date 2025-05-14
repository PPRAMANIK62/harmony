import { useAuth } from "@/contexts/auth-context";
import { search, type SpotifyTrack } from "@/services/spotify";
import { Music, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSong: (trackData: SpotifyTrack) => void;
};

const AddSongDialog = ({ onAddSong, onOpenChange, open }: Props) => {
  const { isSpotifyConnected, connectSpotify } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || !isSpotifyConnected) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await search(searchQuery);
        setSearchResults(results.tracks);
      } catch (error) {
        console.error("Error searching Spotify:", error);
        toast.error("Failed to search Spotify");
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isSpotifyConnected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrack) {
      toast.error("Please select a song from the search results");
      return;
    }

    setIsLoading(true);

    try {
      onAddSong(selectedTrack);
      setSearchQuery("");
      setSelectedTrack(null);
      setSearchResults([]);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add song");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setSearchQuery(track.name); // Update input field with selected track name
  };

  if (!isSpotifyConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Connect to Spotify</DialogTitle>
            <DialogDescription>
              You need to connect your Spotify account to add songs
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Music size={48} className="text-harmony-primary" />
            <p className="text-center text-harmony-gray">
              Connect your Spotify account to search and add songs to the
              playlist
            </p>
            <Button onClick={connectSpotify}>Connect Spotify</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle>Add Song</DialogTitle>
          <DialogDescription>
            Search for a song on Spotify to add to the playlist
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song..."
              className="bg-black/20 pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-harmony-gray" />
          </div>

          {isSearching && (
            <div className="text-center py-4">
              <p className="text-harmony-gray text-sm">Searching...</p>
            </div>
          )}

          {searchResults.length > 0 && !selectedTrack && (
            <div className="max-h-60 overflow-y-auto bg-black/30 rounded-md">
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center p-2 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handleTrackSelect(track)}
                >
                  <div className="h-10 w-10 flex-shrink-0">
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="h-full w-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium truncate">{track.name}</p>
                    <p className="text-xs text-harmony-gray truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTrack && (
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0">
                  {selectedTrack.album.images[0] && (
                    <img
                      src={selectedTrack.album.images[0].url}
                      alt={selectedTrack.album.name}
                      className="h-full w-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="font-medium truncate">{selectedTrack.name}</p>
                  <p className="text-sm text-harmony-gray truncate">
                    {selectedTrack.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    setSelectedTrack(null);
                    setSearchQuery("");
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedTrack || isLoading}>
              {isLoading ? "Adding..." : "Add Song"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSongDialog;
