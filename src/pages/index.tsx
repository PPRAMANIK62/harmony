import AuthDialog from "@/components/auth-dialog";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-harmony-background flex-grow flex flex-col">
        {/* Navigation */}
        <header className="border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Logo size="md" />

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setAuthDialogOpen(true)}>
                Log In with Spotify
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-12 md:py-24 flex-grow flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-harmony-primary to-harmony-accent bg-clip-text text-transparent">
              Listen Together, <br />
              Anywhere
            </h1>
            <p className="text-lg md:text-xl text-harmony-gray mb-8 max-w-lg">
              Create virtual rooms where you and your friends can enjoy music in
              perfect sync, chat, and build playlists together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                onClick={() => setAuthDialogOpen(true)}
                className="bg-harmony-primary hover:bg-harmony-primary/90 text-black font-semibold"
              >
                Get Started
              </Button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-harmony-primary/20 absolute -top-8 -left-8 animate-pulse-light"></div>
              <div
                className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-harmony-secondary/20 absolute -bottom-8 -right-8 animate-pulse-light"
                style={{ animationDelay: "1s" }}
              ></div>
              <div className="glass-card rounded-lg p-4 relative z-10 shadow-lg">
                <div className="w-64 h-96 md:w-80 md:h-[28rem] rounded-md bg-black/40 backdrop-blur overflow-hidden">
                  {/* Mock UI Preview */}
                  <div className="border-b border-white/10 p-3">
                    <h3 className="font-semibold">Chill Vibes Room</h3>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <div className="glass-card p-2 rounded-md flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-harmony-secondary/50"></div>
                      <div className="flex-1">
                        <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                        <div className="h-2 w-1/2 bg-white/10 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="glass-card p-2 rounded-md flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-harmony-secondary/50"></div>
                      <div className="flex-1">
                        <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                        <div className="h-2 w-1/2 bg-white/10 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="glass-card p-2 rounded-md flex items-center gap-2 bg-harmony-primary/30">
                      <div className="w-8 h-8 rounded bg-harmony-primary/50 flex items-center justify-center">
                        <div className="equalizer-bars">
                          <div className="equalizer-bar"></div>
                          <div className="equalizer-bar"></div>
                          <div className="equalizer-bar"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-3/4 bg-white/30 rounded"></div>
                        <div className="h-2 w-1/2 bg-white/20 rounded mt-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-harmony-secondary/50"></div>
                        <div className="flex flex-col justify-center">
                          <div className="h-2 w-16 bg-white/20 rounded"></div>
                          <div className="h-2 w-24 bg-white/10 rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10"></div>
                        <div className="w-6 h-6 rounded-full bg-harmony-primary/50"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo size="sm" />
          </div>
          <div className="text-sm text-harmony-gray">
            &copy; {new Date().getFullYear()} Harmony. All rights reserved.
          </div>
        </div>
      </footer>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
