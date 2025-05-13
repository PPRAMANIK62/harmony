import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { AtSign, KeyRound, Music, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type AuthMode = "login" | "register";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: AuthMode;
};

const AuthDialog = ({
  onOpenChange,
  open,
  mode: initialMode = "login",
}: Props) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state?.from?.pathname as string) || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (mode === "register" && !name)) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          throw error;
        }
      } else {
        if (!name) return;
        const { error } = await signUp(email, password, name);
        if (error) {
          throw error;
        }
      }
      toast.success(
        mode === "login" ? "Welcome back!" : "Registered successfully!"
      );
    } catch (error) {
      toast.error(`Failed to ${mode === "login" ? "log in" : "register"}`);
      console.error(error);
    } finally {
      setIsLoading(false);
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
            <DialogTitle className="text-2xl">
              {mode === "login" ? "Welcome Back" : "Join Harmony"}
            </DialogTitle>
            <DialogDescription className="text-harmony-gray">
              {mode === "login"
                ? "Log in to your account to join rooms and share music"
                : "Create an account to start sharing music with friends"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {mode === "register" && (
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4 text-harmony-primary" />
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-black/20 border-harmony-primary/20 focus-visible:border-harmony-primary/50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium flex items-center gap-2"
            >
              <AtSign className="h-4 w-4 text-harmony-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="bg-black/20 border-harmony-primary/20 focus-visible:border-harmony-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4 text-harmony-primary" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-black/20 border-harmony-primary/20 focus-visible:border-harmony-primary/50"
            />
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full mt-6",
              "bg-gradient-to-r from-harmony-primary to-harmony-accent hover:from-harmony-primary/90 hover:to-harmony-accent/90 text-white font-medium"
            )}
            disabled={isLoading}
          >
            {isLoading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
                ? "Log In"
                : "Register"}
          </Button>

          <div className="text-center text-sm pt-2">
            {mode === "login" ? (
              <p className="text-harmony-gray">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={toggleMode}
                  className="p-0 h-auto text-harmony-primary hover:text-harmony-primary/80"
                >
                  Register
                </Button>
              </p>
            ) : (
              <p className="text-harmony-gray">
                Already have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={toggleMode}
                  className="p-0 h-auto text-harmony-primary hover:text-harmony-primary/80"
                >
                  Log In
                </Button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
