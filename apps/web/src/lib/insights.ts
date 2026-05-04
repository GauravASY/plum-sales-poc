import type { UserProfile } from "@plum/shared";

export type InsightSeverity = "high" | "medium" | "low";

export type InsightScope =
  | "header"
  | "lead"
  | "membership"
  | "perks"
  | "claims"
  | "prefill";

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  scope: InsightScope;
}

const NEGATIVE_FEEDBACK_PATTERN = /\b(bad|poor|average|terrible|awful|okay|ok)\b/i;
const POSITIVE_FEEDBACK_PATTERN = /\b(excellent|great|very good|amazing|fantastic)\b/i;

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function latestPerkActivity(profile: UserProfile): number | null {
  const dates = [
    profile.perks.lastPerkBoughtDate,
    profile.perks.cultPurchaseDate,
    profile.perks.hcTakenDate,
    profile.perks.thTakenDate,
  ]
    .map(daysSince)
    .filter((d): d is number => d !== null);
  if (dates.length === 0) return null;
  return Math.min(...dates);
}

export function computeInsights(profile: UserProfile): Insight[] {
  const insights: Insight[] = [];
  const isActive = profile.identifiers.memberStatus === "Active";
  const isInactive = profile.identifiers.memberStatus === "Inactive";

  if (isInactive) {
    insights.push({
      id: "win-back",
      title: "Win-back required",
      description:
        "Member is currently inactive — open with a renewal pitch and address blockers.",
      severity: "high",
      scope: "header",
    });
  }

  if (profile.lead.query) {
    insights.push({
      id: "open-query",
      title: "Address the open query first",
      description: `Lead asked: "${profile.lead.query}". Resolve before pitching.`,
      severity: "high",
      scope: "lead",
    });
  }

  if (
    profile.lead.callBackRequested === "Yes" &&
    profile.lead.callBackRequestedAt
  ) {
    const ago = daysSince(profile.lead.callBackRequestedAt);
    if (ago != null && ago <= 7) {
      insights.push({
        id: "callback-due",
        title: "Callback due",
        description: `Customer requested a callback ${ago === 0 ? "today" : `${ago}d ago`} — honor it before anything else.`,
        severity: "high",
        scope: "lead",
      });
    }
  }

  const quoteCount = profile.lead.quotesCount ?? 0;
  const leadUpdatedAgo = daysSince(profile.lead.leadUpdated);
  if (quoteCount > 0 && leadUpdatedAgo != null && leadUpdatedAgo >= 14) {
    insights.push({
      id: "stale-quote",
      title: "Stale quote — reignite",
      description: `${quoteCount} quote${quoteCount > 1 ? "s" : ""} generated, last touched ${leadUpdatedAgo}d ago.`,
      severity: "medium",
      scope: "lead",
    });
  }

  const noPerks =
    profile.perks.perksBought === "No" &&
    profile.perks.cultPurchases === "No" &&
    profile.perks.hcTaken === "No" &&
    profile.perks.thTaken === "No";

  if (noPerks && isActive) {
    const onboardedDays = daysSince(profile.identifiers.onboardedDate) ?? 0;
    if (onboardedDays >= 30) {
      insights.push({
        id: "first-perk",
        title: "First-perk pitch opportunity",
        description: `Active member for ${onboardedDays}d but zero wellness perks used — strong intro target.`,
        severity: "high",
        scope: "perks",
      });
    }
  } else if (isActive) {
    const lastActivity = latestPerkActivity(profile);
    if (lastActivity != null && lastActivity >= 90) {
      insights.push({
        id: "perk-reengage",
        title: "Re-engage with a fresh perk",
        description: `Last perk activity was ${lastActivity}d ago — propose something new.`,
        severity: "medium",
        scope: "perks",
      });
    }
  }

  if (profile.perks.hcTaken === "No" && isActive) {
    insights.push({
      id: "hc-unused",
      title: "Health check unused",
      description: "Free annual health check is on the table — easy yes for most members.",
      severity: "low",
      scope: "perks",
    });
  }

  if (profile.claims.latestFeedback) {
    if (NEGATIVE_FEEDBACK_PATTERN.test(profile.claims.latestFeedback)) {
      insights.push({
        id: "service-recovery",
        title: "Service-recovery call needed",
        description: `Recent feedback: "${profile.claims.latestFeedback}". Acknowledge before pitching.`,
        severity: "high",
        scope: "claims",
      });
    } else if (POSITIVE_FEEDBACK_PATTERN.test(profile.claims.latestFeedback)) {
      insights.push({
        id: "advocate",
        title: "Happy customer — ask for referral",
        description: `Positive feedback: "${profile.claims.latestFeedback}". Good moment to request a referral or upsell.`,
        severity: "low",
        scope: "claims",
      });
    }
  }

  if (
    profile.claims.claimExperience === "Yes" &&
    profile.perks.perksBought === "No"
  ) {
    insights.push({
      id: "claim-no-perks",
      title: "Used a claim, no perks yet",
      description:
        "Customer has lived through a claim but never tapped wellness perks — bridge naturally from claim experience to prevention.",
      severity: "medium",
      scope: "perks",
    });
  }

  return dedupe(insights);
}

function dedupe(insights: Insight[]): Insight[] {
  const seen = new Set<string>();
  return insights.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

const SEVERITY_RANK: Record<InsightSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function maxSeverityForScope(
  insights: Insight[],
  scope: InsightScope,
): InsightSeverity | null {
  const scoped = insights.filter((i) => i.scope === scope);
  if (scoped.length === 0) return null;
  return scoped.reduce<InsightSeverity>(
    (acc, cur) => (SEVERITY_RANK[cur.severity] > SEVERITY_RANK[acc] ? cur.severity : acc),
    "low",
  );
}
