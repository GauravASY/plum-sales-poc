import type { UserProfile } from "@plum/shared";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getOpenRouterChat } from "./openrouter.js";
import {
  buildDatasetSummary,
  redactProfileForPrompt,
} from "../data/summary.js";
import { getDataSource } from "../data/index.js";

const SYSTEM_PROMPT = `You are a Plum Insurance sales coach embedded in a sales console. A rep is on a call with a specific customer right now and is asking you for help. Stay grounded in the data provided — quote actual field values, dates, and amounts. If the data does not support an answer, say so honestly rather than guessing.

Tone: warm, direct, sales-aware. Default to under 150 words. Use Markdown when it helps (lists, bold, blockquotes for draft messages). Do not invent customer-specific facts that are not in the profile.

Active customer profile (PII redacted, JSON):
{activeProfile}

Other Plum customers in the dataset (compact summary, JSON) — use this only when the rep explicitly asks for cross-user comparisons or patterns:
{datasetSummary}

When the rep asks you to draft an SMS, email, or talking script, produce ready-to-send text. When the rep asks an analytical question, lead with the answer in one sentence and follow with brief reasoning.`;

export type QaTurn = { role: "user" | "assistant"; content: string };

const HISTORY_LIMIT = 12;

function toLangchainMessages(history: QaTurn[]) {
  return history.slice(-HISTORY_LIMIT).map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
  );
}

export async function* streamQa(
  profile: UserProfile,
  history: QaTurn[],
  question: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, void> {
  const ds = await getDataSource();
  const datasetSummary = buildDatasetSummary(ds.all(), profile.id);
  const llm = getOpenRouterChat({ temperature: 0.4, maxTokens: 600 });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);

  const chain = prompt.pipe(llm);
  const stream = await chain.stream(
    {
      activeProfile: JSON.stringify(redactProfileForPrompt(profile), null, 2),
      datasetSummary: JSON.stringify(datasetSummary),
      history: toLangchainMessages(history),
      question,
    },
    { signal },
  );

  for await (const chunk of stream) {
    if (signal?.aborted) break;
    const text = typeof chunk.content === "string"
      ? chunk.content
      : Array.isArray(chunk.content)
        ? chunk.content.map((c) => ("text" in c ? c.text : "")).join("")
        : "";
    if (text) yield text;
  }
}
