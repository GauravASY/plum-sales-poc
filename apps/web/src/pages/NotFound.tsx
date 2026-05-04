import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-plum-800 via-plum-900 to-background" />

      <div className="relative z-10 glass-card rounded-2xl p-8 text-center space-y-5 animate-fade-in">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-white/10 text-white mx-auto">
          <Compass className="size-7" />
        </div>
        <div>
          <h1 className="text-2xl font-normal text-white tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-white/50 max-w-xs">
            This page doesn't exist. Let's get you back on track.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link to="/">Search</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/browse">Browse</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}