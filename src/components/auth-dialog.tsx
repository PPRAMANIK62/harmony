import { useAuth } from "@/contexts/auth-context";
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
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Log In" : "Register"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Log in to your account to join rooms and share music"
              : "Create an account to start sharing music with friends"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-black/20"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-black/20"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
                ? "Log In"
                : "Register"}
          </Button>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={toggleMode}
                  className="p-0 h-auto"
                >
                  Register
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={toggleMode}
                  className="p-0 h-auto"
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
