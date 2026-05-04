import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  const code = err?.code ?? "INTERNAL_ERROR";
  const message = err?.message ?? "Something went wrong";
  if (status >= 500) console.error("[api error]", err);
  res.status(status).json({ error: { code, message } });
};
