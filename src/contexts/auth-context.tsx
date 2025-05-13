import { env } from "@/env";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/types";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface AuthContextProps {
  // Regular auth properties
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  loading: boolean;
  // Spotify auth properties
  isSpotifyConnected: boolean;
  connectSpotify: () => void;
  disconnectSpotify: () => Promise<void>;
  spotifyLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Regular auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Spotify auth state
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyLoading, setSpotifyLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // If user is logged in, fetch their profile
      if (currentSession?.user) {
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user has Spotify connected
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      if (!user || !session) {
        setIsSpotifyConnected(false);
        setSpotifyLoading(false);
        return;
      }

      try {
        // Check if the session has a provider token (Spotify)
        const isConnected = !!session.provider_token;
        setIsSpotifyConnected(isConnected);
      } catch (error) {
        console.error("Error checking Spotify connection:", error);
        setIsSpotifyConnected(false);
      } finally {
        setSpotifyLoading(false);
      }
    };

    checkSpotifyConnection();
  }, [user, session]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = useCallback(async () => {
    try {
      setSpotifyLoading(true);
      // Use Supabase OAuth provider for Spotify
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          scopes:
            "user-read-private user-read-email streaming user-library-read user-library-modify user-read-playback-state user-modify-playback-state user-read-currently-playing",
          redirectTo: env.VITE_SPOTIFY_REDIRECT_URI,
        },
      });

      if (error) {
        throw error;
      }

      // If we have a URL, redirect to it
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to generate Spotify login URL");
      }
    } catch (error) {
      console.error("Error connecting to Spotify:", error);
      toast.error("Failed to connect to Spotify");
      setSpotifyLoading(false);
    }
  }, []);

  const disconnectSpotify = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to disconnect Spotify");
      return;
    }

    try {
      setSpotifyLoading(true);

      // Sign out and sign back in to remove the provider connection
      await supabase.auth.signOut();

      // After signing out, we need to sign back in
      // This will be handled by the auth state change listener

      setIsSpotifyConnected(false);
      toast.success("Spotify disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting Spotify:", error);
      toast.error("Failed to disconnect Spotify");
    } finally {
      setSpotifyLoading(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        // Regular auth properties
        session,
        user,
        profile,
        signOut,
        loading,
        // Spotify auth properties
        isSpotifyConnected,
        connectSpotify,
        disconnectSpotify,
        spotifyLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
