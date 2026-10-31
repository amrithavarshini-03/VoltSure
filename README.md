# ⚡ VoltSure AI
### Confidence-Aware EV Mobility Intelligence

> **Don't just predict the range. Prove the journey is feasible.**

**HackFront India · Problem Statement T6.1 — "Will I Make It"**


---

## The problem

A dashboard range number can mislead. Hills, heat, stop-start traffic, payload and battery
ageing all change how far an EV really goes. A charger shown on a map may be occupied,
faulty, incompatible or stale. Riders end up overcharging, avoiding trips, or getting stranded.

## What VoltSure AI does

VoltSure is a decision engine, not another EV map. For a given vehicle, battery state and
route, it estimates the probability of arriving with a protected energy reserve, explains
the risks, and recommends the most dependable feasible plan.

| Innovation | What it does |
|---|---|
| **Personalised energy prediction** | Predicts Wh/km for each route segment from speed, elevation, temperature, traffic and payload |
| **Battery and thermal context** | Adjusts usable-energy assumptions and widens uncertainty when data is thin |
| **Charger Trust Score** | Scores chargers by compatibility, status freshness, session history and occupancy at arrival time |
| **Risk-budget route planner** | Enforces a confidence target and energy reserve instead of just minimising distance |
| **Fleet and swap extension** | Dispatch suitability for fleets and battery-pack ranking for swap networks |

## Signature feature: Proof Before You Go

Before departure, VoltSure shows predicted energy with a plausible range, arrival SoC
interval, charger evidence, a fallback plan, and a counterfactual explanation of why a
route was accepted or rejected. When traffic or charger status changes, it replans and
says exactly what changed.

## Honesty first

- All data in this prototype is **simulated and labelled as such**.
- Probabilities are estimates under stated assumptions, **not guarantees**.
- No OEM partnership, live charger integration or validated vehicle performance is claimed.
- Ola S1 Z appears only as a reference vehicle profile using user-supplied claimed figures.
- Evaluation results are from a **synthetic held-out dataset** and are kept separate from scenario demos.

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Framer Motion · Leaflet · Recharts · Zustand · Vitest

## Run locally

\`\`\`bash
git clone https://github.com/amrithavarshini-03/VoltSure.git
cd VoltSure
npm install
npm run dev
\`\`\`

## Demo script

Click **Judge Mode** in the app for a guided 60-second walkthrough:
dashboard range → segment forecast → direct route rejected → charger trust evidence →
alternative selected → simulated charger failure → live replan → evaluation results.

## Roadmap

Fleet pilot → authorised OEM and charging-network adapters → real-world calibration → battery-swap workflows.

---
*Concept prototype. All unvalidated values are illustrative.*
