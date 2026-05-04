import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  StopCircle,
  AlertTriangle,
} from "lucide-react";
import type { UserProfile } from "@plum/shared";
import { api } from "@/lib/api";
import { readSseStream } from "@/lib/sse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Status = "idle" | "streaming" | "done" | "error" | "aborted";

export function PitchPanel({ profile }: { profile: UserProfile }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const generate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
    setStatus("streaming");

    try {
      const res = await api.pitchStream(
        { profileId: profile.id, focus: focus.trim() || undefined },
        { signal: controller.signal },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error?.message ?? `Request failed (${res.status})`);
        setStatus("error");
        return;
      }
      for await (const evt of readSseStream(res, controller.signal)) {
        if (evt.event === "token") {
          const data = evt.data as { text?: string };
          if (data?.text) setText((t) => t + data.text);
        } else if (evt.event === "done") {
          setStatus("done");
        } else if (evt.event === "aborted") {
          setStatus("aborted");
        } else if (evt.event === "error") {
          const data = evt.data as { message?: string };
          setError(data?.message ?? "Pitch generation failed.");
          setStatus("error");
        }
      }
      setStatus((s) => (s === "streaming" ? "done" : s));
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") {
        setStatus("aborted");
      } else {
        setError((err as Error)?.message ?? "Network error");
        setStatus("error");
      }
    }
  }, [profile.id, focus]);

  const stop = () => abortRef.current?.abort();

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const isStreaming = status === "streaming";
  const hasContent = text.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-coral-500" /> AI Sales Pitch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="pitch-focus" className="text-xs font-medium text-plum-500">
            Focus (optional)
          </label>
          <Input
            id="pitch-focus"
            placeholder="e.g. maternity rider, renewal upsell"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            disabled={isStreaming}
            className="h-9 text-sm"
          />
        </div>

        <div className="flex gap-2">
          {!isStreaming ? (
            <Button onClick={generate} className="flex-1" size="sm">
              <Sparkles className="size-4" />
              {hasContent ? "Regenerate" : "Generate pitch"}
            </Button>
          ) : (
            <Button onClick={stop} variant="destructive" className="flex-1" size="sm">
              <StopCircle className="size-4" /> Stop
            </Button>
          )}
          {hasContent && !isStreaming && (
            <Button
              onClick={copy}
              variant="outline"
              size="sm"
              aria-label="Copy pitch"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </Button>
          )}
          {hasContent && !isStreaming && (
            <Button
              onClick={generate}
              variant="ghost"
              size="sm"
              aria-label="Regenerate"
            >
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 text-red-800 p-2.5 text-xs">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {(hasContent || isStreaming) && (
          <div
            className={cn(
              "rounded-lg border-2 border-plum-100 bg-plum-50/50 px-3 py-2.5 text-sm",
              isStreaming && "animate-fade-in",
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wide text-coral-600 first:mt-0">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wide text-coral-600 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-2 mb-1 text-xs font-semibold tracking-tight text-plum-800">
                    {children}
                  </h3>
                ),
                p: ({ children }) => <p className="my-1 leading-snug">{children}</p>,
                ul: ({ children }) => (
                  <ul className="my-1 list-disc pl-5 space-y-0.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-1 list-decimal pl-5 space-y-0.5">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-snug">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-plum-900">{children}</strong>
                ),
                em: ({ children }) => <em className="text-plum-500">{children}</em>,
                code: ({ children }) => (
                  <code className="rounded bg-plum-200 px-1 py-0.5 text-[11px] font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
            {isStreaming && (
              <div className="mt-2 flex items-center gap-2 text-xs text-plum-500">
                <span className="size-1.5 rounded-full bg-coral-500 animate-soft-pulse" />
                <span>Generating…</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}