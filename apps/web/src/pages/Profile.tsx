import { useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { computeInsights, maxSeverityForScope, type InsightScope } from "@/lib/insights";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import {
  ClaimsCard,
  LeadCard,
  MembershipCard,
  PerksCard,
  PrefillCard,
} from "@/components/profile/ProfileCards";
import { InsightBanner } from "@/components/profile/InsightBanner";
import { PitchPanel } from "@/components/profile/PitchPanel";
import { QAPanel } from "@/components/profile/QAPanel";
import { PulseHighlight } from "@/components/PulseHighlight";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function ProfileSkeleton() {
  return (
    <div className="container py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export function ProfilePage() {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => api.getProfile(id),
    enabled: !!id,
  });

  const profile = data?.profile;
  const insights = useMemo(
    () => (profile ? computeInsights(profile) : []),
    [profile],
  );

  const cardRefs = {
    lead: useRef<HTMLDivElement>(null),
    membership: useRef<HTMLDivElement>(null),
    perks: useRef<HTMLDivElement>(null),
    claims: useRef<HTMLDivElement>(null),
    prefill: useRef<HTMLDivElement>(null),
    header: useRef<HTMLDivElement>(null),
  } as const;

  const focusScope = (scope: InsightScope) => {
    const target = cardRefs[scope].current;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add("ring-2", "ring-plum-400", "ring-offset-2");
    window.setTimeout(() => {
      target.classList.remove("ring-2", "ring-plum-400", "ring-offset-2");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div>
        <div className="border-b bg-white">
          <div className="container py-5">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium mb-2">Profile not found</p>
            <p className="text-muted-foreground mb-4">
              We couldn't load this customer's profile.
            </p>
            <Button asChild>
              <Link to="/">Back to lookup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sev = (scope: InsightScope) => maxSeverityForScope(insights, scope);

  return (
    <div className="min-h-full">
      <div ref={cardRefs.header} className="rounded-2xl">
        <PulseHighlight severity={sev("header")}>
          <ProfileHeader profile={profile} />
        </PulseHighlight>
      </div>
      <div className="container py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <InsightBanner
            insights={insights}
            onSelect={(i) => focusScope(i.scope)}
          />

          <div ref={cardRefs.lead} className="rounded-xl transition-shadow">
            <PulseHighlight severity={sev("lead")}>
              <LeadCard profile={profile} />
            </PulseHighlight>
          </div>

          <div ref={cardRefs.membership} className="rounded-xl transition-shadow">
            <PulseHighlight severity={sev("membership")}>
              <MembershipCard profile={profile} />
            </PulseHighlight>
          </div>

          <div ref={cardRefs.perks} className="rounded-xl transition-shadow">
            <PulseHighlight severity={sev("perks")}>
              <PerksCard profile={profile} />
            </PulseHighlight>
          </div>

          <div ref={cardRefs.claims} className="rounded-xl transition-shadow">
            <PulseHighlight severity={sev("claims")}>
              <ClaimsCard profile={profile} />
            </PulseHighlight>
          </div>

          <div ref={cardRefs.prefill} className="rounded-xl transition-shadow">
            <PulseHighlight severity={sev("prefill")}>
              <PrefillCard profile={profile} />
            </PulseHighlight>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <PitchPanel profile={profile} />
          <QAPanel profile={profile} />
        </aside>
      </div>
    </div>
  );
}
