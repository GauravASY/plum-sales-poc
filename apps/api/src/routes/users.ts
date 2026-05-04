import { Router } from "express";
import { z } from "zod";
import { getDataSource } from "../data/index.js";

export const usersRouter = Router();

const searchQuery = z.object({
  q: z.string().min(1, "q is required").max(120),
});

usersRouter.get("/search", async (req, res, next) => {
  try {
    const parsed = searchQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "INVALID_QUERY", message: parsed.error.issues[0]?.message ?? "Invalid query" },
      });
    }
    const ds = await getDataSource();
    const profile = ds.findByContact(parsed.data.q);
    if (!profile) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "No user matched that contact." } });
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/", async (_req, res, next) => {
  try {
    const ds = await getDataSource();
    res.json({ profiles: ds.all() });
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const ds = await getDataSource();
    const profile = ds.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Profile not found." } });
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});
