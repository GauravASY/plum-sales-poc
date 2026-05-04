import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { UserProfile } from "@plum/shared";
import { api } from "@/lib/api";
import { computeInsights } from "@/lib/insights";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

interface Tagged {
  profile: UserProfile;
  highSeverityCount: number;
  totalSeverityCount: number;
  archetype: string;
}

function classifyArchetype(profile: UserProfile, insightCount: number): string {
  const status = profile.identifiers.memberStatus;
  if (status === "Inactive") return "Win-back";
  const feedback = profile.claims.latestFeedback?.toLowerCase() ?? "";
  if (/bad|poor|terrible/.test(feedback)) return "Service recovery";
  if (/excellent|amazing|fantastic/.test(feedback)) return "Advocate";
  const perksScore = [
    profile.perks.perksBought,
    profile.perks.cultPurchases,
    profile.perks.hcTaken,
    profile.perks.thTaken,
  ].filter((v) => v === "Yes").length;
  if (perksScore >= 3) return "Highly engaged";
  if (perksScore === 0) return "First-perk target";
  if (insightCount >= 2) return "Multi-signal";
  return "Steady";
}

const ARCHETYPE_STYLES: Record<string, string> = {
  "Win-back": "bg-red-50 text-red-700 border-red-200",
  "Service recovery": "bg-coral/10 text-red-700 border-coral/30",
  Advocate: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Highly engaged": "bg-plum-50 text-plum-700 border-plum-200",
  "First-perk target": "bg-amber/10 text-amber-900 border-amber/40",
  "Multi-signal": "bg-cyan/10 text-cyan-700 border-cyan/30",
  Steady: "bg-muted text-muted-foreground border-border",
};

export function BrowsePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "list"],
    queryFn: () => api.listUsers(),
  });

  const tagged = useMemo<Tagged[]>(() => {
    if (!data?.profiles) return [];
    return data.profiles.map((profile) => {
      const insights = computeInsights(profile);
      const highSeverityCount = insights.filter((i) => i.severity === "high").length;
      return {
        profile,
        highSeverityCount,
        totalSeverityCount: insights.length,
        archetype: classifyArchetype(profile, insights.length),
      };
    });
  }, [data]);

  return (
    <div className="min-h-full bg-muted/30">
<div className="border-b" style={{ backgroundColor: "#3b0e2c" }}>
        <div className="container py-5 flex items-center gap-3">
          <Button asChild size="icon" variant="ghost" aria-label="Back to lookup" className="text-[#fff1e6] hover:bg-white/10">
            <Link to="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#fff1e6" }}>Sample customers</h1>
            <p className="text-sm" style={{ color: "#fff1e6", opacity: 0.8 }}>
              Pick any customer to see the 360° profile, conversion signals, and AI tools.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {error && (
          <Card>
            <CardContent className="p-6 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              <span>Couldn't load customers. Is the API running?</span>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        )}

        {!isLoading && tagged.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tagged.map(({ profile, archetype, highSeverityCount, totalSeverityCount }) => (
              <li key={profile.id}>
                <Link
                  to={`/u/${encodeURIComponent(profile.id)}`}
                  className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                >
                  <Card className="h-full hover:shadow-md hover:border-plum-200 transition-shadow">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold tracking-tight">
                            {profile.identifiers.name || profile.id}
                          </div>
                          {profile.identifiers.orgBrandName && (
                            <div className="mt-0.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                              <Building2 className="size-3" />
                              {profile.identifiers.orgBrandName}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            profile.identifiers.memberStatus === "Active" ? "success" : "muted"
                          }
                        >
                          {profile.identifiers.memberStatus ?? "—"}
                        </Badge>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 self-start rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                          ARCHETYPE_STYLES[archetype] ?? ARCHETYPE_STYLES.Steady
                        }`}
                      >
                        <Sparkles className="size-3" />
                        {archetype}
                      </div>

                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-muted-foreground">Coverage</dt>
                          <dd className="font-medium">
                            {profile.identifiers.coverageType ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Sum insured</dt>
                          <dd className="font-medium">
                            {formatINR(profile.identifiers.sumInsured)}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-auto pt-2 border-t flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          {highSeverityCount > 0 ? (
                            <>
                              <AlertTriangle className="size-3 text-coral" />
                              {highSeverityCount} urgent · {totalSeverityCount} total
                            </>
                          ) : totalSeverityCount > 0 ? (
                            <>
                              <Sparkles className="size-3 text-plum-500" />
                              {totalSeverityCount} signal{totalSeverityCount > 1 ? "s" : ""}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-3 text-emerald-500" />
                              No flags
                            </>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-plum-600">
                          Open <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
