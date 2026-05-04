import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";
import { aiRouter } from "./routes/ai.js";
import { errorMiddleware } from "./middleware/error.js";

export const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api", aiRouter);

app.use(errorMiddleware);
