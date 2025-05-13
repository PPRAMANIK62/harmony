import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-harmony-background">
      <div className="glass-card p-8 rounded-lg text-center max-w-md flex items-center flex-col">
        <Logo size="lg" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-harmony-primary">404</h1>
        <p className="text-xl text-harmony-gray mb-8">
          Oops! We couldn't find that page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="text-black font-semibold">
            <Link to="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
