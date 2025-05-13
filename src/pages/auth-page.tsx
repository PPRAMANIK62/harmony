import AuthDialog from "@/components/auth-dialog";
import Logo from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { Music } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state?.from?.pathname as string) || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  return (
    <div className="min-h-screen bg-harmony-background overflow-hidden relative flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-harmony-primary/10 absolute -top-64 -left-64 animate-pulse-light"></div>
        <div
          className="w-[600px] h-[600px] rounded-full bg-harmony-secondary/10 absolute -bottom-96 -right-96 animate-pulse-light"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="w-[400px] h-[400px] rounded-full bg-harmony-accent/10 absolute top-1/2 -right-64 animate-pulse-light"
          style={{ animationDelay: "0.8s" }}
        ></div>
      </div>

      {/* Header with logo */}
      <header className="w-full border-b border-white/10 py-4 px-6 z-10">
        <Link to="/" className="inline-block">
          <Logo size="md" />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 z-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-harmony-primary/20 flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-harmony-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-harmony-primary to-harmony-accent bg-clip-text text-transparent">
              Welcome to Harmony
            </h1>
            <p className="text-harmony-gray">
              Sign in to your account to continue your musical journey
            </p>
          </div>

          <AuthDialog open={true} onOpenChange={() => {}} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-sm text-harmony-gray z-10">
        &copy; {new Date().getFullYear()} Harmony. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthPage;
