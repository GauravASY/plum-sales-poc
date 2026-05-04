import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Search, AlertCircle, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LookupPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const lookup = useMutation({
    mutationFn: (q: string) => api.searchUser(q),
    onSuccess: (data) => {
      navigate(`/u/${encodeURIComponent(data.profile.id)}`);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    lookup.mutate(q);
  };

  const error = lookup.error as ApiError | undefined;
  const notFound = error?.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-plum-800 via-plum-900 to-background" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-2 rounded-full bg-coral-500 animate-pulse" />
            <span className="tracking-wide uppercase text-[11px]">Sales Console</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-normal mb-3 tracking-tight" style={{ color: "#fff1e5" }}>
            Find your <span className="text-gradient">customer</span>
          </h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Search by email or mobile to view their complete profile
          </p>
        </div>

        <div className="glass-card rounded-2xl p-1 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={submit} className="bg-plum-900/50 rounded-[1.25rem] p-6">
            <label htmlFor="contact" className="text-xs uppercase tracking-wide text-white/40 mb-2 block">
              Search
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                <Input
                  id="contact"
                  autoFocus
                  placeholder="email or mobile number"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-11"
                />
              </div>
              <Button
                type="submit"
                disabled={lookup.isPending || !query.trim()}
                size="lg"
                className="min-w-[100px]"
              >
                {lookup.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </span>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {notFound && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 p-3 text-sm">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>No member found for that search term.</span>
              </div>
            )}
            {error && !notFound && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-sm">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Try{" "}
          <button
            type="button"
            className="text-white/50 hover:text-coral-400 transition-colors"
            onClick={() => setQuery("test1@example.com")}
          >
            test1@example.com
          </button>{" "}
          or{" "}
          <button
            type="button"
            className="text-white/50 hover:text-coral-400 transition-colors"
            onClick={() => setQuery("9876543212")}
          >
            9876543212
          </button>
          {" — or "}
          <Link
            to="/browse"
            className="text-white/50 hover:text-coral-400 transition-colors"
          >
            browse all
          </Link>
        </p>
      </div>
    </div>
  );
}