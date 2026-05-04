import type { UserProfile } from "@plum/shared";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getOpenRouterChat } from "./openrouter.js";

const SYSTEM_PROMPT = `You are a senior Plum Insurance sales coach helping a sales rep prepare for a customer call. Generate a concise, warm, consultative pitch grounded strictly in the customer's history below. Do not invent facts that are not present in the profile.

Output exactly this Markdown structure with these exact H2 headings, in this order:

## Opener
1–2 sentences acknowledging the customer's specific situation. Use their first name.

## Talking Points
3–5 bullets, each tied to a specific data point in the profile (membership tenure, perks usage, claims history, recent feedback, or open query). Be specific — reference the actual values.

## Recommended Plan
2–3 sentences recommending the next product, perk, or action to pitch, with brief reasoning rooted in the profile.

## Anticipated Objections
2–3 likely objections, each with a one-line rebuttal. Format each as a bullet:
- **Objection:** ... — *Rebuttal:* ...

## Closing Ask
A single direct, actionable next step (e.g. "Book a free Health Check by Friday", "Send the maternity rider quote within 2 hours").

Constraints:
- Total length under 280 words.
- Plain Markdown only — no preamble, no closing remarks, no code fences.
- If a data point is missing, omit it rather than guessing.`;

const USER_PROMPT_TEMPLATE = `Customer profile (PII redacted):
{profile}

Open query: {query}

Focus area from rep (optional): {focus}

Generate the pitch now.`;

function redactProfile(profile: UserProfile) {
  return {
    name: profile.identifiers.name,
    org: profile.identifiers.orgBrandName,
    memberStatus: profile.identifiers.memberStatus,
    coverageType: profile.identifiers.coverageType,
    sumInsured: profile.identifiers.sumInsured,
    onboardedDate: profile.identifiers.onboardedDate,
    latestPolicyStartDate: profile.identifiers.latestPolicyStartDate,
    lead: {
      source: profile.lead.source,
      quotesCount: profile.lead.quotesCount,
      leadCreated: profile.lead.leadCreated,
      leadUpdated: profile.lead.leadUpdated,
      callBackRequested: profile.lead.callBackRequested,
      callBackRequestedAt: profile.lead.callBackRequestedAt,
    },
    perks: profile.perks,
    claims: profile.claims,
    prefill: profile.prefill,
  };
}

export async function* streamPitch(
  profile: UserProfile,
  focus: string | null,
  signal?: AbortSignal,
): AsyncGenerator<string, void, void> {
  const llm = getOpenRouterChat({ temperature: 0.45, maxTokens: 700 });
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", USER_PROMPT_TEMPLATE],
  ]);
  const chain = prompt.pipe(llm);

  const stream = await chain.stream(
    {
      profile: JSON.stringify(redactProfile(profile), null, 2),
      query: profile.lead.query ?? "(no open query — proactive outreach)",
      focus: focus?.trim() || "(none)",
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
