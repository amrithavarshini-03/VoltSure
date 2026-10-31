# VoltSure AI — Architecture & Engineering Specification

**Problem Statement:** HackFront India — Problem Statement T6.1 "Will I Make It"  
**Tagline:** *"Don't just predict the range. Prove the journey is feasible."*

---

## 1. Six-Layer Architecture Overview

VoltSure AI separates physics modeling, uncertainty simulation, telemetry freshness decay, and explainability into six isolated layers:

```
┌────────────────────────────────────────────────────────┐
│  Layer 6: Feedback, Calibration & Benchmarking         │
│  - 120-trip held-out synthetic evaluation              │
│  - Brier score (0.08) & reliability diagram           │
├────────────────────────────────────────────────────────┤
│  Layer 5: Explainable Interface & Decision Artifacts  │
│  - Counterfactual advice generator (binary search)     │
│  - Truth Mode metadata popovers & Boarding Pass export │
├────────────────────────────────────────────────────────┤
│  Layer 4: Bayesian Charger Trust & Risk-Aware Planner  │
│  - Exponential telemetry decay: w = exp(-age / 45m)    │
│  - Beta-prior session reliability & connector gating   │
│  - Joint Monte Carlo route ranking with fallbacks      │
├────────────────────────────────────────────────────────┤
│  Layer 3: Uncertainty & Protected Reserve Engine       │
│  - Seeded Mulberry32 PRNG (2,000 runs)                 │
│  - Log-normal multiplicative noise scaled to history   │
│  - Protected reserve threshold enforcement             │
├────────────────────────────────────────────────────────┤
│  Layer 2: Vehicle Physics Energy Twin                  │
│  - First-principles tractive forces: Fr + Fa + Fg      │
│  - Drivetrain & regenerative braking efficiencies      │
│  - Learned environmental & traffic penalty corrections │
├────────────────────────────────────────────────────────┤
│  Layer 1: Data Ingestion & Adapter Boundary            │
│  - Abstract VehicleAdapter & ChargingAdapter interfaces│
│  - Strict provenance tagging: REAL, PUBLIC, SIMULATED  │
│  - Explicit stubs for authorized CAN and OCPP 2.0.1    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Mathematical Formulations

### 2.1 Segment Mechanical Power & Energy
For segment $i$ with speed $v$, road slope angle $\theta = \arctan(\text{gradePercent} / 100)$, and total vehicle mass $m = m_{\text{curb}} + m_{\text{rider}} + m_{\text{payload}}$:

- **Aerodynamic Drag:**  
  `Fa = 0.5 * rho * CdA * v^2`  
  where air density $\rho \approx 1.184\text{ kg/m}^3$ at ~30°C / 400m elevation.

- **Rolling Resistance:**  
  `Fr = Cr * m * g * cos(theta)`

- **Gravitational Force:**  
  `Fg = m * g * sin(theta)`

- **Mechanical Power:**  
  `P_mech = (Fa + Fr + Fg) * v`

- **Electrical Conversion:**  
  - If `P_mech >= 0`:  
    `P_elec = (P_mech / eta_drivetrain) + P_aux`  
  - If `P_mech < 0` (Regeneration on descent):  
    `P_elec = max(P_mech * eta_regen, -1500) + P_aux`

- **Learned Correction Multipliers:**  
  - Traffic: Free = 1.00, Moderate = 1.12 (+12%), Heavy stop-start = 1.28 (+28%)  
  - Ambient Temperature: Derating active outside the 20°C–30°C optimal electrochemical window.

### 2.2 Bayesian Charger Trust Score
- **Compatibility Gate:**  
  If vehicle connectors $\cap$ charger connectors $= \emptyset$, Trust Score $\equiv 0$.
- **Freshness Weight:**  
  `w_fresh = exp(-statusAgeMinutes / 45)`
- **Historical Mean (Beta Prior):**  
  `p_hist = (successes + 1) / (successes + failures + 2)`
- **Composite Usability:**  
  `P_usable = w_fresh * p_status + (1 - w_fresh) * p_hist - occupancyPenalty - faultPenalty`
- **Trust Score:**  
  `TrustScore = round(100 * lowerConfidenceBound(P_usable))`

---

## 3. Technology Stack

- **Runtime:** Vite + React 18 + TypeScript (strict mode)
- **Styling:** Tailwind CSS v3 (Custom non-dark Light Theme design tokens)
- **Animation:** Framer Motion
- **Router:** React Router (HashRouter for GitHub Pages)
- **Global State:** Zustand
- **Map:** Leaflet + React-Leaflet + CARTO Positron light tiles with offline telemetry fallback grid
- **Charts:** Recharts
- **Unit Testing:** Vitest (6/6 passing deterministic assertions)
- **Certificate Export:** html-to-image

