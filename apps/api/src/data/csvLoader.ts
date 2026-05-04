import fs from "node:fs/promises";
import Papa from "papaparse";
import type {
  UserProfile,
  YesNo,
  Identifiers,
  LeadEngagement,
  WellnessPerks,
  ClaimsFeedback,
  PrefillForm,
} from "@plum/shared";
import type { DataSource } from "./loader.js";

type RawRow = Record<string, string>;

const normalizeHeader = (h: string): string =>
  h.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const HEADER_MAP: Record<string, keyof CanonicalRow> = {
  mob_no: "mobile",
  email: "email",
  name: "name",
  query: "query",
  source: "source",
  call_back_requested: "callBackRequested",
  call_back_requested_at_date: "callBackRequestedAt",
  org_brand_name: "orgBrandName",
  org_legal_name: "orgLegalName",
  doj: "doj",
  onboarded_date: "onboardedDate",
  policy_start_date_latest: "latestPolicyStartDate",
  si: "sumInsured",
  coverage_type: "coverageType",
  member_status: "memberStatus",
  pre_filled_form_details_age: "age",
  pre_filled_form_details_relationship: "relationship",
  pre_filled_form_details_pincode: "pincode",
  number_of_quotes_generated: "quotesCount",
  lead_created: "leadCreated",
  lead_updated: "leadUpdated",
  perks_bought: "perksBought",
  last_perk_bought: "lastPerkBought",
  last_perk_bought_date: "lastPerkBoughtDate",
  cult_purchases: "cultPurchases",
  cult_purcashe_date: "cultPurchaseDate",
  cult_purchase_date: "cultPurchaseDate",
  hc_taken: "hcTaken",
  hc_taken_date: "hcTakenDate",
  th_taken: "thTaken",
  th_taken_date: "thTakenDate",
  claim_experience_yes_no: "claimExperience",
  latest_feedback_shared: "latestFeedback",
};

interface CanonicalRow {
  mobile?: string;
  email?: string;
  name?: string;
  query?: string;
  source?: string;
  callBackRequested?: string;
  callBackRequestedAt?: string;
  orgBrandName?: string;
  orgLegalName?: string;
  doj?: string;
  onboardedDate?: string;
  latestPolicyStartDate?: string;
  sumInsured?: string;
  coverageType?: string;
  memberStatus?: string;
  age?: string;
  relationship?: string;
  pincode?: string;
  quotesCount?: string;
  leadCreated?: string;
  leadUpdated?: string;
  perksBought?: string;
  lastPerkBought?: string;
  lastPerkBoughtDate?: string;
  cultPurchases?: string;
  cultPurchaseDate?: string;
  hcTaken?: string;
  hcTakenDate?: string;
  thTaken?: string;
  thTakenDate?: string;
  claimExperience?: string;
  latestFeedback?: string;
}

const REQUIRED_COLUMNS: (keyof CanonicalRow)[] = ["mobile", "email", "name"];

const trimOrNull = (v: string | undefined): string | null => {
  if (v === undefined) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
};

const toYesNo = (v: string | undefined): YesNo => {
  const t = trimOrNull(v);
  if (!t) return null;
  const u = t.toLowerCase();
  if (u === "yes" || u === "y" || u === "true") return "Yes";
  if (u === "no" || u === "n" || u === "false") return "No";
  return null;
};

const toNumber = (v: string | undefined): number | null => {
  const t = trimOrNull(v);
  if (!t) return null;
  const n = Number(t.replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const toIsoDate = (v: string | undefined): string | null => {
  const t = trimOrNull(v);
  if (!t) return null;
  // Accept yyyy-mm-dd or dd/mm/yyyy or dd-mm-yyyy
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  let y: string, m: string, d: string;
  const isoMatch = t.match(iso);
  const dmyMatch = t.match(dmy);
  if (isoMatch) {
    [, y, m, d] = isoMatch as unknown as [string, string, string, string];
  } else if (dmyMatch) {
    [, d, m, y] = dmyMatch as unknown as [string, string, string, string];
  } else {
    const parsed = Date.parse(t);
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString().slice(0, 10);
  }
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

const normalizeMobile = (v: string | undefined): string => {
  const digits = (trimOrNull(v) ?? "").replace(/\D/g, "");
  // Strip India country code if present
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(3);
  return digits;
};

const normalizeEmail = (v: string | undefined): string =>
  (trimOrNull(v) ?? "").toLowerCase();

function rowToProfile(row: CanonicalRow, index: number): UserProfile {
  const mobile = normalizeMobile(row.mobile);
  const email = normalizeEmail(row.email);

  const identifiers: Identifiers = {
    mobile,
    email,
    name: trimOrNull(row.name) ?? "",
    orgBrandName: trimOrNull(row.orgBrandName),
    orgLegalName: trimOrNull(row.orgLegalName),
    doj: toIsoDate(row.doj),
    onboardedDate: toIsoDate(row.onboardedDate),
    latestPolicyStartDate: toIsoDate(row.latestPolicyStartDate),
    sumInsured: toNumber(row.sumInsured),
    coverageType: trimOrNull(row.coverageType),
    memberStatus: trimOrNull(row.memberStatus),
  };

  const lead: LeadEngagement = {
    query: trimOrNull(row.query),
    source: trimOrNull(row.source),
    callBackRequested: toYesNo(row.callBackRequested),
    callBackRequestedAt: toIsoDate(row.callBackRequestedAt),
    leadCreated: toIsoDate(row.leadCreated),
    leadUpdated: toIsoDate(row.leadUpdated),
    quotesCount: toNumber(row.quotesCount),
  };

  const perks: WellnessPerks = {
    perksBought: toYesNo(row.perksBought),
    lastPerkBought: trimOrNull(row.lastPerkBought),
    lastPerkBoughtDate: toIsoDate(row.lastPerkBoughtDate),
    cultPurchases: toYesNo(row.cultPurchases),
    cultPurchaseDate: toIsoDate(row.cultPurchaseDate),
    hcTaken: toYesNo(row.hcTaken),
    hcTakenDate: toIsoDate(row.hcTakenDate),
    thTaken: toYesNo(row.thTaken),
    thTakenDate: toIsoDate(row.thTakenDate),
  };

  const claims: ClaimsFeedback = {
    claimExperience: toYesNo(row.claimExperience),
    latestFeedback: trimOrNull(row.latestFeedback),
  };

  const prefill: PrefillForm = {
    age: toNumber(row.age),
    relationship: trimOrNull(row.relationship),
    pincode: trimOrNull(row.pincode),
  };

  // Stable id: prefer email, then mobile, then row index
  const id = email || mobile || `row-${index}`;

  return { id, identifiers, lead, perks, claims, prefill };
}

function parseCsv(content: string): CanonicalRow[] {
  const parsed = Papa.parse<RawRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h,
  });

  if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
    throw new Error("CSV has no header row");
  }

  const headerLookup = new Map<string, keyof CanonicalRow>();
  for (const original of parsed.meta.fields) {
    const normalized = normalizeHeader(original);
    const canonical = HEADER_MAP[normalized];
    if (canonical) headerLookup.set(original, canonical);
  }

  const present = new Set(headerLookup.values());
  const missing = REQUIRED_COLUMNS.filter((c) => !present.has(c));
  if (missing.length > 0) {
    throw new Error(`CSV missing required columns: ${missing.join(", ")}`);
  }

  return parsed.data.map((raw) => {
    const out: CanonicalRow = {};
    for (const [original, canonical] of headerLookup) {
      const value = raw[original];
      if (value !== undefined) {
        (out as Record<string, string>)[canonical] = value;
      }
    }
    return out;
  });
}

export class CsvDataSource implements DataSource {
  private profiles: UserProfile[] = [];
  private byEmail = new Map<string, UserProfile>();
  private byMobile = new Map<string, UserProfile>();
  private byId = new Map<string, UserProfile>();

  constructor(private readonly csvPath: string) {}

  async load(): Promise<void> {
    const content = await fs.readFile(this.csvPath, "utf8");
    const rows = parseCsv(content);
    this.profiles = rows.map((row, idx) => rowToProfile(row, idx));
    this.byEmail.clear();
    this.byMobile.clear();
    this.byId.clear();
    for (const p of this.profiles) {
      if (p.identifiers.email) this.byEmail.set(p.identifiers.email, p);
      if (p.identifiers.mobile) this.byMobile.set(p.identifiers.mobile, p);
      this.byId.set(p.id, p);
    }
  }

  async reload(): Promise<void> {
    await this.load();
  }

  all(): UserProfile[] {
    return this.profiles;
  }

  findByContact(query: string): UserProfile | null {
    const trimmed = query.trim();
    if (!trimmed) return null;
    if (trimmed.includes("@")) {
      return this.byEmail.get(trimmed.toLowerCase()) ?? null;
    }
    const mobile = normalizeMobile(trimmed);
    return this.byMobile.get(mobile) ?? null;
  }

  findById(id: string): UserProfile | null {
    return this.byId.get(id) ?? null;
  }
}

export const __testing = { parseCsv, normalizeHeader, normalizeMobile, toIsoDate, toYesNo };
