import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Phone } from "lucide-react";
import type { UserProfile } from "@plum/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMobile } from "@/lib/format";

export function ProfileHeader({ profile }: { profile: UserProfile }) {
  const { identifiers } = profile;
  const status = identifiers.memberStatus;
  const variant: "success" | "muted" | "default" =
    status === "Active" ? "success" : status === "Inactive" ? "muted" : "default";

  return (
    <div className="rounded-2xl glass-card">
      <div className="container py-5 flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-start gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link to="/" aria-label="Back to lookup" className="hover:bg-white/10">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-normal text-white tracking-tight">
                {identifiers.name || "Unknown"}
              </h1>
              {status && <Badge variant={variant}>{status}</Badge>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/50">
              {identifiers.orgBrandName && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-coral-500" />
                  <span className="text-white/70">{identifiers.orgBrandName}</span>
                </span>
              )}
              {identifiers.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 text-coral-500" />
                  <span className="text-white/70">{identifiers.email}</span>
                </span>
              )}
              {identifiers.mobile && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 text-coral-500" />
                  <span className="text-white/70">{formatMobile(identifiers.mobile)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}