import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { InsightSeverity } from "@/lib/insights";
import { cn } from "@/lib/utils";

interface PulseHighlightProps extends HTMLAttributes<HTMLDivElement> {
  severity?: InsightSeverity | null;
  active?: boolean;
  children: ReactNode;
}

const SEVERITY_CLASS: Record<InsightSeverity, string> = {
  high: "pulse-high ring-2 ring-coral/60",
  medium: "pulse-medium ring-2 ring-amber/60",
  low: "pulse-low ring-1 ring-plum/40",
};

export function PulseHighlight({
  severity,
  active = true,
  children,
  className,
  style,
  ...rest
}: PulseHighlightProps) {
  const enabled = active && severity != null;
  return (
    <div
      className={cn(
        "rounded-xl transition-shadow",
        enabled && SEVERITY_CLASS[severity!],
        enabled && "animate-pulse-ring",
        className,
      )}
      style={style as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
