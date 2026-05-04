export type YesNo = "Yes" | "No" | null;

export type MemberStatus = "Active" | "Inactive" | string;

export interface Identifiers {
  mobile: string;
  email: string;
  name: string;
  orgBrandName: string | null;
  orgLegalName: string | null;
  doj: string | null;
  onboardedDate: string | null;
  latestPolicyStartDate: string | null;
  sumInsured: number | null;
  coverageType: string | null;
  memberStatus: MemberStatus | null;
}

export interface LeadEngagement {
  query: string | null;
  source: string | null;
  callBackRequested: YesNo;
  callBackRequestedAt: string | null;
  leadCreated: string | null;
  leadUpdated: string | null;
  quotesCount: number | null;
}

export interface WellnessPerks {
  perksBought: YesNo;
  lastPerkBought: string | null;
  lastPerkBoughtDate: string | null;
  cultPurchases: YesNo;
  cultPurchaseDate: string | null;
  hcTaken: YesNo;
  hcTakenDate: string | null;
  thTaken: YesNo;
  thTakenDate: string | null;
}

export interface ClaimsFeedback {
  claimExperience: YesNo;
  latestFeedback: string | null;
}

export interface PrefillForm {
  age: number | null;
  relationship: string | null;
  pincode: string | null;
}

export interface UserProfile {
  id: string;
  identifiers: Identifiers;
  lead: LeadEngagement;
  perks: WellnessPerks;
  claims: ClaimsFeedback;
  prefill: PrefillForm;
}
