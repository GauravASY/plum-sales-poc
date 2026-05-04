import { Sparkles, AlertTriangle, Info, Lightbulb } from "lucide-react";
import type { Insight, InsightSeverity } from "@/lib/insights";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<
  InsightSeverity,
  { pill: string; icon: string; dot: string; label: string; labelBg: string; labelText: string }
> = {
  high: {
    pill: "bg-coral-50 text-coral-700 border-coral-200 hover:bg-coral-100",
    icon: "text-coral-500",
    dot: "bg-coral-500",
    label: "Urgent",
    labelBg: "bg-coral-200",
    labelText: "text-coral-900",
  },
  medium: {
    pill: "bg-white text-amber-800 hover:bg-amber-50",
    icon: "text-amber-600",
    dot: "bg-amber-500",
    label: "Opportunity",
    labelBg: "bg-amber-200",
    labelText: "text-amber-900",
  },
  low: {
    pill: "bg-white text-plum-700 hover:bg-plum-50",
    icon: "text-plum-500",
    dot: "bg-plum-500",
    label: "FYI",
    labelBg: "bg-plum-200",
    labelText: "text-plum-900",
  },
};

const SEVERITY_RANK: Record<InsightSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const ICON_FOR_SEVERITY: Record<InsightSeverity, typeof Sparkles> = {
  high: AlertTriangle,
  medium: Lightbulb,
  low: Info,
};

export function InsightBanner({
  insights,
  onSelect,
}: {
  insights: Insight[];
  onSelect?: (insight: Insight) => void;
}) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-plum-200 bg-cream-100 p-4 text-sm text-plum-500 flex items-center gap-2 animate-fade-in">
        <Sparkles className="size-4 text-plum-400" />
        No flagged opportunities for this customer right now.
      </div>
    );
  }

  const ordered = [...insights].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  );

  return (
    <div className="rounded-xl border border-plum-200 bg-cream-100 p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Sparkles className="size-4 text-coral-500" />
          {ordered.some((i) => i.severity === "high") && (
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-coral-500 animate-soft-pulse" />
          )}
        </div>
        <h2 className="text-sm font-semibold text-plum-900">Conversion signals</h2>
        <span className="text-xs text-plum-500">
          {ordered.length} flagged
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {ordered.map((insight) => {
          const styles = SEVERITY_STYLES[insight.severity];
          const Icon = ICON_FOR_SEVERITY[insight.severity];
          return (
            <li key={insight.id}>
              <button
                type="button"
                onClick={() => onSelect?.(insight)}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5 transition-colors flex items-start gap-3",
                  styles.pill,
                )}
              >
                <Icon className={cn("size-4 mt-0.5 shrink-0", styles.icon)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-plum-900">{insight.title}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        styles.labelBg,
                        styles.labelText,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", styles.dot)} />
                      {styles.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-plum-600 line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}