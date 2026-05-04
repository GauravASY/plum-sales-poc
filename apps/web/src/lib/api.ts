import type { UserProfile } from "@plum/shared";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let body: { error?: { code?: string; message?: string } } = {};
    try {
      body = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? `Request failed (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  listUsers: () => request<{ profiles: UserProfile[] }>("/api/users"),

  searchUser: (q: string) =>
    request<{ profile: UserProfile }>(`/api/users/search?q=${encodeURIComponent(q)}`),

  getProfile: (id: string) =>
    request<{ profile: UserProfile }>(`/api/users/${encodeURIComponent(id)}`),

  pitchStream: (
    body: { profileId: string; focus?: string },
    init?: { signal?: AbortSignal },
  ) =>
    fetch("/api/pitch", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal: init?.signal,
    }),

  qaStream: (
    body: {
      profileId: string;
      question: string;
      history: { role: "user" | "assistant"; content: string }[];
    },
    init?: { signal?: AbortSignal },
  ) =>
    fetch("/api/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal: init?.signal,
    }),
};
