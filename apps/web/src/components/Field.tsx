import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[11px] uppercase tracking-wide text-plum-500">{label}</span>
      <span className="text-sm font-medium text-plum-900 break-words">{value}</span>
    </div>
  );
}