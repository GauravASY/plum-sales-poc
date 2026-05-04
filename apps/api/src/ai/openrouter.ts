import { ChatOpenAI } from "@langchain/openai";

const DEFAULT_MODEL = "liquid/lfm-2.5-1.2b-instruct:free";

export class MissingApiKeyError extends Error {
  status = 503;
  code = "MISSING_API_KEY";
  constructor() {
    super(
      "OPENROUTER_API_KEY is not set. Add it to .env to enable AI features.",
    );
  }
}

export function getOpenRouterChat(opts: { temperature?: number; maxTokens?: number } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  return new ChatOpenAI({
    apiKey,
    model,
    temperature: opts.temperature ?? 0.4,
    maxTokens: opts.maxTokens ?? 800,
    streaming: true,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://plum-sales-dashboard.local",
        "X-Title": "Plum Sales Dashboard",
      },
    },
  });
}