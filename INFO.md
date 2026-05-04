# Plum Sales Dashboard — Product Overview

## What Is This?

The Plum Sales Dashboard is an AI-powered internal tool built for Plum Insurance sales reps. Before getting on a call with a customer, a rep can look up the customer by their email or phone number and instantly get a complete, organized view of everything relevant — their policy, their engagement history, their wellness usage, their claims — all on one screen.

Then, with a single click, the tool generates a personalized sales pitch tailored to that specific customer and their situation. No generic scripts. No digging through spreadsheets. Just relevant, ready-to-use talking points in seconds.

---

## The Problem It Solves

Today, sales reps go into customer calls underprepared. Customer data lives in multiple places — CRM, policy systems, wellness platforms — and there's no time to stitch it together before a call. Reps either wing it or spend 15–20 minutes manually pulling information.

The result: generic pitches, missed upsell opportunities, and customers who feel like just another number.

---

## Key Features

### 1. Instant 360° Customer Lookup
Type in a customer's email or mobile number and get their full profile in under a second — policy type, sum insured, membership status, lead history, perks usage, claims, and pre-fill form details, all organized into clear sections.

### 2. AI-Generated Sales Pitch
One click generates a structured, personalized pitch with:
- A warm **opener** using the customer's first name and situation
- **Talking points** grounded in their actual data (how long they've been a member, what perks they use, whether they've had a claim)
- A **recommended plan or action** to pitch next
- **Likely objections** the customer might raise, with ready rebuttals
- A clear **closing ask** — a specific, actionable next step

The rep can also add a focus area (e.g. "maternity rider" or "renewal upsell") to steer the pitch.

### 3. AI Q&A — Ask Anything About the Customer
After reviewing the profile, the rep can ask free-form questions like:
- *"Has this customer ever complained about service?"*
- *"What's the best product to pitch given their age and family size?"*
- *"Draft an SMS to follow up on their callback request."*

The AI answers using only the customer's real data — no hallucinations, no invented facts.

### 4. Conversion Signal Highlights
The dashboard automatically surfaces the most important signals for each customer — highlighted visually so reps know at a glance what to focus on. A customer who requested a callback two weeks ago and hasn't been contacted? Flagged. A customer who bought a gym perk but hasn't tried a health check? Flagged. These signals are prioritized by urgency.

### 5. Customer Archetype Gallery
A browsable gallery of customer archetypes — "Win-back", "Highly Engaged", "Service Recovery", "First-Perk Target" — so reps and managers can quickly identify patterns and prioritize outreach.

---

## Business Impact

### More Conversions, Less Prep Time
A rep who used to spend 15–20 minutes preparing for a call can now be ready in under 2 minutes. That time compounds across a full day of calls — more calls handled, more opportunities pursued.

### Higher-Quality Pitches
AI-generated pitches grounded in real customer data consistently surface the right product at the right time. A customer who just had a good claims experience is a prime candidate for a renewal upgrade. A customer who's been inactive is a win-back opportunity. The tool catches these automatically.

### No Missed Signals
With automatic flagging of high-priority signals (pending callbacks, lapsed perks, open queries), fewer leads fall through the cracks. Reps focus on customers who are most likely to convert.

### Consistent, Consultative Tone
Every rep, regardless of experience level, gets a pitch that sounds warm, knowledgeable, and tailored — not like a call-center script. This raises the baseline quality of every customer interaction.

---

## How It Fits Into the Workflow

1. Rep receives a call or prepares for an outbound call.
2. They open the dashboard and type the customer's email or phone number.
3. They review the 360° profile and the highlighted signals (takes ~30 seconds).
4. They click "Generate Pitch" — the AI generates a tailored pitch in real time.
5. They can ask follow-up questions before the call if needed.
6. They get on the call, fully prepared.

---

## Current State & Roadmap

This is a working demo with 10 sample customer profiles. The data layer is designed to be swapped out — the next step is connecting it to the live data source (Google Sheets or Metabase) to make it fully operational with real customers.

The core AI features are live and production-ready. Moving to a full rollout requires:
- Connecting the live data source
- Adding login/authentication for reps
- Deploying to a shared internal URL

---

## Why Now

Sales reps are the direct revenue line. Any tool that helps them walk into a call better prepared — even 10% better — compounds across every interaction, every day. This tool is built, tested, and working. The investment to go from demo to live is small. The upside is immediate.
