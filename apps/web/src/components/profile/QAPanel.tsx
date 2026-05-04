import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MessageCircle,
  Send,
  StopCircle,
  RotateCcw,
  AlertTriangle,
  User,
  Sparkles,
} from "lucide-react";
import type { UserProfile } from "@plum/shared";
import { api } from "@/lib/api";
import { readSseStream } from "@/lib/sse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
interface Turn {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "What perk should I pitch next?",
  "Summarize this customer's journey in 3 bullets",
  "Draft a follow-up SMS",
  "Compare this user to others who bought a Health Check",
];

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-2 mb-1 text-xs font-semibold uppercase tracking-wide text-coral-600">
      {children}
    </h3>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-2 mb-1 text-xs font-semibold uppercase tracking-wide text-coral-600">
      {children}
    </h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-2 mb-0.5 text-[11px] font-semibold tracking-tight text-plum-800">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-1 leading-snug">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-1 list-disc pl-4 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-1 list-decimal pl-4 space-y-0.5">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-snug">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-plum-900">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-plum-500">{children}</em>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-coral-300 pl-2 italic my-1.5">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-plum-200 px-1 py-0.5 text-[10px] font-mono">
      {children}
    </code>
  ),
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function QAPanel({ profile }: { profile: UserProfile }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setTurns([]);
    setInput("");
    setError(null);
    setStreaming(false);
  }, [profile.id]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  const send = useCallback(
    async (questionRaw: string) => {
      const question = questionRaw.trim();
      if (!question || streaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setError(null);
      setStreaming(true);

      const historyForServer = turns.map((t) => ({
        role: t.role,
        content: t.content,
      }));

      const userTurn: Turn = { id: newId(), role: "user", content: question };
      const assistantTurn: Turn = {
        id: newId(),
        role: "assistant",
        content: "",
        streaming: true,
      };
      setTurns((prev) => [...prev, userTurn, assistantTurn]);
      setInput("");

      const appendToken = (text: string) =>
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurn.id ? { ...t, content: t.content + text } : t,
          ),
        );

      const finishStreaming = () =>
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurn.id ? { ...t, streaming: false } : t,
          ),
        );

      try {
        const res = await api.qaStream(
          { profileId: profile.id, question, history: historyForServer },
          { signal: controller.signal },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.error?.message ?? `Request failed (${res.status})`);
          setTurns((prev) => prev.filter((t) => t.id !== assistantTurn.id));
          return;
        }
        for await (const evt of readSseStream(res, controller.signal)) {
          if (evt.event === "token") {
            const data = evt.data as { text?: string };
            if (data?.text) appendToken(data.text);
          } else if (evt.event === "error") {
            const data = evt.data as { message?: string };
            setError(data?.message ?? "Q&A failed.");
          }
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setError((err as Error)?.message ?? "Network error");
        }
      } finally {
        finishStreaming();
        setStreaming(false);
      }
    },
    [profile.id, streaming, turns],
  );

  const stop = () => abortRef.current?.abort();

  const clear = () => {
    abortRef.current?.abort();
    setTurns([]);
    setError(null);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = turns.length === 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-4 text-coral-500" /> Ask anything
        </CardTitle>
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] text-plum-400 hover:text-plum-600 inline-flex items-center gap-1"
            aria-label="Clear conversation"
          >
            <RotateCcw className="size-3" /> Clear
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={scrollRef}
          className={cn(
            "rounded-lg border-2 border-plum-100 bg-plum-50/30 px-3 py-3 overflow-y-auto",
            isEmpty ? "min-h-[120px]" : "h-72",
          )}
        >
          {isEmpty ? (
            <div className="space-y-3">
              <p className="text-xs text-plum-500">
                Ask about this customer or compare across the dataset.
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={streaming}
                    className="text-left text-xs rounded-md border border-plum-200 bg-white px-2.5 py-1.5 hover:bg-plum-50 hover:border-coral-300 transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {turns.map((t) => (
                <li
                  key={t.id}
                  className={cn(
                    "flex gap-2",
                    t.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {t.role === "assistant" && (
                    <div className="size-6 shrink-0 rounded-full bg-coral-100 flex items-center justify-center text-coral-600">
                      <Sparkles className="size-3" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm max-w-[85%] animate-fade-in",
                      t.role === "user"
                        ? "bg-coral-500 text-white"
                        : "bg-white border-2 border-plum-100",
                    )}
                  >
                    {t.role === "assistant" ? (
                      <>
                        {t.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {t.content}
                          </ReactMarkdown>
                        ) : (
                          <span className="text-plum-400 italic">
                            Thinking…
                          </span>
                        )}
                        {t.streaming && (
                          <span className="ml-1 inline-block size-1.5 rounded-full bg-coral-500 animate-soft-pulse align-middle" />
                        )}
                      </>
                    ) : (
                      <span className="whitespace-pre-wrap break-words">
                        {t.content}
                      </span>
                    )}
                  </div>
                  {t.role === "user" && (
                    <div className="size-6 shrink-0 rounded-full bg-coral-600 flex items-center justify-center text-white">
                      <User className="size-3" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 text-red-800 p-2.5 text-xs">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
            rows={2}
            disabled={streaming}
            className="flex-1 resize-none rounded-lg border-2 border-plum-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-plum-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:border-coral-500 disabled:opacity-50"
          />
          {streaming ? (
            <Button onClick={stop} variant="outline" size="icon" aria-label="Stop">
              <StopCircle className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={() => send(input)}
              size="icon"
              disabled={!input.trim()}
              aria-label="Send"
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}