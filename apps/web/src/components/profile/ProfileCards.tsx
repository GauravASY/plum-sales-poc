import type { UserProfile } from "@plum/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/Field";
import { DASH, fallback, formatDate, formatINR, relativeTime } from "@/lib/format";
import {
  ShieldCheck,
  Sparkles,
  HeartPulse,
  MessageSquare,
  ClipboardList,
  Calendar,
} from "lucide-react";

function YesNoBadge({ value, trueIs = "default" }: { value: "Yes" | "No" | null; trueIs?: "success" | "default" | "warning" }) {
  if (value === "Yes") return <Badge variant={trueIs}>Yes</Badge>;
  if (value === "No") return <Badge variant="muted">No</Badge>;
  return <Badge variant="muted">{DASH}</Badge>;
}

export function MembershipCard({ profile }: { profile: UserProfile }) {
  const i = profile.identifiers;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-coral-500" /> Membership
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Field label="Date of Joining" value={formatDate(i.doj)} />
        <Field label="Onboarded" value={formatDate(i.onboardedDate)} />
        <Field label="Latest Policy Start" value={formatDate(i.latestPolicyStartDate)} />
        <Field label="Sum Insured" value={formatINR(i.sumInsured)} />
        <Field label="Coverage Type" value={fallback(i.coverageType)} />
        <Field label="Org Legal Name" value={fallback(i.orgLegalName)} />
      </CardContent>
    </Card>
  );
}

export function LeadCard({ profile }: { profile: UserProfile }) {
  const l = profile.lead;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4 text-coral-500" /> Lead & Engagement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {l.query ? (
          <div className="rounded-xl bg-plum-100 border border-plum-200 p-3">
            <div className="text-[11px] uppercase tracking-wide text-plum-600 mb-1">
              Open query
            </div>
            <div className="text-sm font-medium text-plum-900">{l.query}</div>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Source" value={fallback(l.source)} />
          <Field label="Quotes generated" value={l.quotesCount ?? DASH} />
          <Field
            label="Lead created"
            value={
              <span className="flex items-center gap-1.5">
                {formatDate(l.leadCreated)}
                {relativeTime(l.leadCreated) && (
                  <span className="text-xs text-plum-400">
                    · {relativeTime(l.leadCreated)}
                  </span>
                )}
              </span>
            }
          />
          <Field
            label="Lead updated"
            value={
              <span className="flex items-center gap-1.5">
                {formatDate(l.leadUpdated)}
                {relativeTime(l.leadUpdated) && (
                  <span className="text-xs text-plum-400">
                    · {relativeTime(l.leadUpdated)}
                  </span>
                )}
              </span>
            }
          />
          <Field
            label="Callback requested"
            value={
              <span className="flex items-center gap-2">
                <YesNoBadge value={l.callBackRequested} trueIs="warning" />
                {l.callBackRequestedAt && (
                  <span className="text-xs text-plum-400">
                    {formatDate(l.callBackRequestedAt)}
                  </span>
                )}
              </span>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PerksCard({ profile }: { profile: UserProfile }) {
  const p = profile.perks;
  const items: { label: string; taken: "Yes" | "No" | null; date: string | null; detail?: string | null }[] = [
    { label: "Perks bought", taken: p.perksBought, date: p.lastPerkBoughtDate, detail: p.lastPerkBought },
    { label: "Cult", taken: p.cultPurchases, date: p.cultPurchaseDate },
    { label: "Health Check (HC)", taken: p.hcTaken, date: p.hcTakenDate },
    { label: "Tele-Health (TH)", taken: p.thTaken, date: p.thTakenDate },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-coral-500" /> Wellness & Perks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-plum-200">
          {items.map((it) => (
            <li key={it.label} className="flex items-center justify-between py-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-plum-900">{it.label}</span>
                {it.detail && (
                  <span className="text-xs text-plum-500">Last: {it.detail}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {it.date && (
                  <span className="inline-flex items-center gap-1 text-xs text-plum-500">
                    <Calendar className="size-3" />
                    {formatDate(it.date)}
                  </span>
                )}
                <YesNoBadge value={it.taken} trueIs="success" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ClaimsCard({ profile }: { profile: UserProfile }) {
  const c = profile.claims;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="size-4 text-coral-500" /> Claims & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field
          label="Claim experience"
          value={<YesNoBadge value={c.claimExperience} trueIs="warning" />}
        />
        <div>
          <div className="text-[11px] uppercase tracking-wide text-plum-500 mb-1">
            Latest feedback
          </div>
          {c.latestFeedback ? (
            <blockquote className="border-l-2 border-coral-300 bg-plum-50 px-3 py-2 text-sm italic text-plum-800">
              <MessageSquare className="size-3.5 inline mr-1 text-coral-500" />
              {c.latestFeedback}
            </blockquote>
          ) : (
            <span className="text-sm text-plum-400">{DASH}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PrefillCard({ profile }: { profile: UserProfile }) {
  const f = profile.prefill;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4 text-coral-500" /> Pre-filled form
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <Field label="Age" value={f.age ?? DASH} />
        <Field label="Relationship" value={fallback(f.relationship)} />
        <Field label="Pincode" value={fallback(f.pincode)} />
      </CardContent>
    </Card>
  );
}