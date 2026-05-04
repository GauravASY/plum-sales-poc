import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[0.75rem] border border-plum-200 bg-white px-4 py-2 text-sm text-plum-900 placeholder:text-plum-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:border-coral-500/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";