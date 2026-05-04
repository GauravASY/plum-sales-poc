import { Router } from "express";
import { z } from "zod";
import { getDataSource } from "../data/index.js";
import { streamPitch } from "../ai/pitchChain.js";
import { streamQa, type QaTurn } from "../ai/qaChain.js";
import { MissingApiKeyError } from "../ai/openrouter.js";

export const aiRouter = Router();

const pitchBody = z.object({
  profileId: z.string().min(1),
  focus: z.string().max(500).optional(),
});

const qaBody = z.object({
  profileId: z.string().min(1),
  question: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .max(40)
    .default([]),
});

function writeSse(res: import("express").Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function startSseResponse(res: import("express").Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

aiRouter.post("/pitch", async (req, res) => {
  const parsed = pitchBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "INVALID_BODY", message: parsed.error.issues[0]?.message ?? "Invalid body" },
    });
  }

  const ds = await getDataSource();
  const profile = ds.findById(parsed.data.profileId);
  if (!profile) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Profile not found." } });
  }

  startSseResponse(res);
  const controller = new AbortController();
  req.on("close", () => controller.abort());

  try {
    for await (const token of streamPitch(profile, parsed.data.focus ?? null, controller.signal)) {
      writeSse(res, "token", { text: token });
    }
    writeSse(res, "done", { ok: true });
  } catch (err) {
    handleStreamError(res, err, "PITCH_FAILED", "Pitch generation failed.");
  } finally {
    res.end();
  }
});

aiRouter.post("/qa", async (req, res) => {
  const parsed = qaBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "INVALID_BODY", message: parsed.error.issues[0]?.message ?? "Invalid body" },
    });
  }

  const ds = await getDataSource();
  const profile = ds.findById(parsed.data.profileId);
  if (!profile) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Profile not found." } });
  }

  startSseResponse(res);
  const controller = new AbortController();
  req.on("close", () => controller.abort());

  try {
    for await (const token of streamQa(
      profile,
      parsed.data.history as QaTurn[],
      parsed.data.question,
      controller.signal,
    )) {
      writeSse(res, "token", { text: token });
    }
    writeSse(res, "done", { ok: true });
  } catch (err) {
    handleStreamError(res, err, "QA_FAILED", "Q&A generation failed.");
  } finally {
    res.end();
  }
});

function handleStreamError(
  res: import("express").Response,
  err: unknown,
  fallbackCode: string,
  fallbackMessage: string,
) {
  if (err instanceof MissingApiKeyError) {
    writeSse(res, "error", { code: err.code, message: err.message });
  } else if ((err as { name?: string })?.name === "AbortError") {
    writeSse(res, "aborted", { ok: true });
  } else {
    console.error("[ai stream]", err);
    writeSse(res, "error", {
      code: fallbackCode,
      message: (err as Error)?.message ?? fallbackMessage,
    });
  }
}
