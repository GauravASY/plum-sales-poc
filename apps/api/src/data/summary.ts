import type { UserProfile } from "@plum/shared";

export interface CompactProfile {
  id: string;
  org: string | null;
  status: string | null;
  coverage: string | null;
  sumInsured: number | null;
  age: number | null;
  perksScore: number;
  perksBought: string | null;
  hcTaken: boolean;
  thTaken: boolean;
  cultBought: boolean;
  hasClaim: boolean;
  feedback: string | null;
  query: string | null;
}

export function compactProfile(p: UserProfile): CompactProfile {
  const perksScore = [
    p.perks.perksBought,
    p.perks.cultPurchases,
    p.perks.hcTaken,
    p.perks.thTaken,
  ].filter((v) => v === "Yes").length;

  return {
    id: p.id,
    org: p.identifiers.orgBrandName,
    status: p.identifiers.memberStatus,
    coverage: p.identifiers.coverageType,
    sumInsured: p.identifiers.sumInsured,
    age: p.prefill.age,
    perksScore,
    perksBought: p.perks.lastPerkBought,
    hcTaken: p.perks.hcTaken === "Yes",
    thTaken: p.perks.thTaken === "Yes",
    cultBought: p.perks.cultPurchases === "Yes",
    hasClaim: p.claims.claimExperience === "Yes",
    feedback: p.claims.latestFeedback,
    query: p.lead.query,
  };
}

export function redactProfileForPrompt(p: UserProfile) {
  return {
    name: p.identifiers.name,
    org: p.identifiers.orgBrandName,
    orgLegal: p.identifiers.orgLegalName,
    memberStatus: p.identifiers.memberStatus,
    coverageType: p.identifiers.coverageType,
    sumInsured: p.identifiers.sumInsured,
    doj: p.identifiers.doj,
    onboardedDate: p.identifiers.onboardedDate,
    latestPolicyStartDate: p.identifiers.latestPolicyStartDate,
    lead: p.lead,
    perks: p.perks,
    claims: p.claims,
    prefill: p.prefill,
  };
}

export function buildDatasetSummary(all: UserProfile[], excludeId?: string): CompactProfile[] {
  return all.filter((p) => p.id !== excludeId).map(compactProfile);
}
