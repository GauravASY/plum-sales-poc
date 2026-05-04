# Sales Dashboard

An AI-powered internal tool built for Sales reps. Look up a customer by email or mobile, see a full 360° profile with auto-flagged conversion signals, and use streaming AI to generate a tailored pitch or get strategic answers grounded in the customer's history.

> **Status:** Demo build. No auth, data is loaded from a local CSV. The data layer is behind a `DataSource` interface that can swap to Google Sheets or Metabase without touching the UI.

---

## 🌟 Key Features

- **Instant 360° Customer Lookup**: Search by email or mobile to get a full profile in under a second (policy type, sum insured, membership status, lead history, perks usage, claims).
- **AI-Generated Sales Pitch**: One click generates a structured, personalized pitch with an opener, talking points, recommended actions, likely objections, and a closing ask.
- **AI Q&A**: Ask free-form questions about the customer. The AI answers using *only* the customer's real data (e.g., "Draft an SMS to follow up on their callback request").
- **Conversion Signal Highlights**: Automatically surfaces the most important signals (pending callbacks, lapsed perks, open queries) so reps know exactly what to focus on.
- **Customer Archetype Gallery**: A browsable gallery of customer archetypes ("Win-back", "Highly Engaged", "Service Recovery") for quick pattern identification.

## 🚀 The Problem It Solves

Sales reps often go into customer calls underprepared because customer data is scattered across CRM, policy systems, and wellness platforms. This leads to generic pitches and missed opportunities.

**Plum Sales Dashboard** solves this by centralizing data and using AI to generate actionable insights and tailored pitches in seconds. The business impact includes:
- **More Conversions**: Prep time drops from 15–20 minutes to under 2 minutes.
- **Higher-Quality Pitches**: Right product, right time, based on actual data.
- **No Missed Signals**: High-priority leads don't fall through the cracks.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS (hand-authored shadcn-style primitives).
- **Backend**: Express, TypeScript, Papaparse, Zod.
- **AI Integration**: LangChain.js, OpenRouter (Anthropic Claude).
- **Architecture**: Monorepo with npm workspaces (`apps/*`, `packages/*`), Server-Sent Events for token streaming.

## 🚦 Quick Start

1. **Clone and setup environment**:
   ```bash
   cp .env.example .env
   ```
   *Note: Add your `OPENROUTER_API_KEY` to `.env` to enable AI features.*

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development servers**:
   ```bash
   npm run dev
   ```
   *API runs on `:8787`, Web UI runs on `:5173`.*

4. **Open the app**: Visit [http://localhost:5173](http://localhost:5173).

## ⚙️ Configuration

| Env Var | Default | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | *(empty)* | OpenRouter key. Without it, the AI panels return a 503. |
| `OPENROUTER_MODEL` | `anthropic/claude-sonnet-4` | Any [OpenRouter model ID](https://openrouter.ai/models). Switch without code changes. |
| `PORT` | `8787` | API port. |
| `PLUM_CSV_PATH` | `data/sample.csv` | Path to the source CSV. Override to point at a different dataset. |

## 🧪 5-Minute Demo Script

The sample CSV exercises every feature. Try these steps:

| Step | Path | What to show |
| --- | --- | --- |
| 1 | `/` | Lookup screen. Click the `9876543212` chip to load Alice Brown (engaged, family-floater 10L). |
| 2 | *On profile* | Insight banner above the cards. Click any insight pill to scroll-and-flash the relevant section. |
| 3 | `/browse` | Sample customers grid with archetype tags (Win-back, Advocate, etc.). |
| 4 | `/u/test4@example.com` | Bob White is **Inactive** — the header pulses red, banner leads with "Win-back required". |
| 5 | `/u/test8@example.com` | Fiona Clark left negative feedback ("Bad") — claims card pulses, banner shows "Service-recovery call needed". |
| 6 | *AI pitch* | On any profile, click **Generate pitch** in the right rail. Tokens stream in as structured Markdown. |
| 7 | *Q&A* | Below the pitch, try a suggested chip like "Draft a follow-up SMS" and chat with the AI. |

## 💾 Data Layer & Architecture

### Swapping the Dataset
Drop a new CSV at `data/sample.csv` (or set `PLUM_CSV_PATH`) and restart the API. The loader (`apps/api/src/data/csvLoader.ts`) handles header variations and normalizes Indian mobile numbers.

### Switching to a Real Data Source
Implement the `DataSource` interface in `apps/api/src/data/loader.ts` (e.g., a `SheetsDataSource` or `MetabaseDataSource`), then swap the singleton in `apps/api/src/data/index.ts`. Routes and UI don't change.

### Documentation Files
- **`CLAUDE.md`** — Guidelines for AI agents (workspace layout, conventions, ESM gotchas).
- **`PROGRESS.md`** — Snapshot of project phases and current status.
- **`LEARNING.md`** — Pitfalls handled and error templates.
- **`INFO.md`** — In-depth product and business overview.

## ⌨️ Scripts

```bash
npm run dev                                          # Start both web and api servers
npm run typecheck                                    # Typecheck all workspaces
npm run build                                        # Build all packages
npm test                                             # Run vitest in @plum/api
npx vitest run apps/api/src/data/csvLoader.test.ts   # Run single test file
npx vitest -w @plum/api -t "finds by email"          # Run tests by name pattern
```
