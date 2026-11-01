# VoltSure AI — EV Mobility Intelligence Platform

> **"Don't just predict the range. Prove the journey is feasible."**

[![Built for HackFront India](https://img.shields.io/badge/HackFront%20India-Problem%20Statement%20T6.1-84CC16?style=for-the-badge)](https://github.com)
[![Engine Tests](https://img.shields.io/badge/Vitest-6%2F6%20Passing-emerald?style=for-the-badge)](https://github.com)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-0284C7?style=for-the-badge)](https://github.com)
[![Design](https://img.shields.io/badge/Design-High--Precision%20Light%20Theme-slate?style=for-the-badge)](https://github.com)

LIVE DEMO: <a href="voltsureev.netlify.app" target="_blank"> VoltSure </a>
---

## 1. Problem Statement & The "Dashboard Illusion"

**HackFront India — Problem Statement T6.1: "Will I Make It"**

Standard electric vehicle dashboards rely on naive **Distance-To-Empty (DTE)** calculations. By dividing remaining battery state of charge by a fixed nominal Wh/km rating, an instrument cluster displays misleading estimates like *"84 km remaining"*, giving riders false confidence for a 35 km journey.

In reality, an unmodelled +320m uphill grade, 33°C thermal derating, stop-start traffic, and a stale en-route charger cause vehicles to stall before reaching their destination, stranding passengers and delivery fleets.

**VoltSure AI** solves this problem not by generating another optimistic number, but by acting as an **explainable decision proof engine**. For any vehicle profile, terrain elevation, weather profile, and uncertain charging network status, it estimates the exact probability of completing the trip with a protected energy reserve intact.

---

## 2. The Five Core Innovations

1. **Segment-Level Personalized Energy Twin:** First-principles tractive modeling (rolling resistance $F_r$, aerodynamic drag $F_a$, road grade $F_g$, and regenerative braking) coupled with learned environmental and traffic correction factors.
2. **Thermal & Battery Risk Intelligence:** Real-time usable capacity derating across high/low temperatures and automated 10% protected reserve budget locking.
3. **Bayesian Charger Trust Score:** Exponential status age decay $w_{\text{fresh}} = \exp(-\text{age} / 45\text{m})$, Laplace/Beta historical session priors, and connector compatibility gating.
4. **Risk-Budget (Probabilistic) Route Planning:** 2,000-run Monte Carlo simulation quantifying arrival risk distributions ($p_{10}$–$p_{50}$–$p_{90}$) and automatic secondary fallback corridor allocation.
5. **Fleet Dispatch & Swap Cabinet Extension:** Fleet suitability classification (`GO`, `GO_WITH_STOP`, `DO_NOT_DISPATCH`) and battery swap diagnostic screening with graceful telemetry gap tolerance.

---

## 3. How to Run Locally

```bash
# Clone the repository
git clone https://github.com/amrithavarshini-03/VoltSure.git
cd VoltSure

# Install dependencies
npm install

# Run engine unit test suite (Vitest)
npm run test

# Launch local development server
npm run dev
```

Open your browser at `http://localhost:5173`. The application runs completely in-browser without requiring external backend servers or paid API keys.

---

## 4. The 60-Second Demo Script (Judge Mode)

VoltSure includes an automated, self-driving **Judge Mode** accessible from the header:

1. **The Dashboard Illusion:** Shows standard dashboard displaying "84 km remaining" for a 35 km trip (Route A).
2. **Segment Physics & Uncertainty:** Reveals segment elevation profiles and the 2,000-sample Monte Carlo fan chart.
3. **Constraint Breach:** Route A is hard-rejected at the 90% confidence target because uphill elevation drains battery into the protected reserve.
4. **Bayesian Charger Trust:** Demonstrates how VoltHub Thadagam's 3h 40m stale status reduces its Trust Score to 38/100 using exponential decay.
5. **Route B Recommendation:** Recommends Route B via GreenGrid Karamadai Hub (94% feasibility) with a secondary fallback at Kavundampalayam.
6. **Dynamic In-Flight Replan:** Simulates a mid-trip charger failure; the engine automatically re-routes to the designated secondary fallback with zero user panic.
7. **Held-Out Evidence:** Inspects the 120-trip benchmark against Baseline A and Baseline B, verifying a 0.08 Brier score and 90% interval coverage.
8. **Boarding-Pass Proof Certificate:** Exports a shareable, cryptographically styled PNG proof certificate.

---

## 5. Mathematical Formulations (Plain Text)

### 5.1 Physics Energy Model
```
Fa (Aero Drag)       = 0.5 * rho * CdA * v^2
Fr (Rolling Resist)  = Cr * m * g * cos(theta)
Fg (Grade Force)     = m * g * sin(theta)
P_mech               = (Fa + Fr + Fg) * v

If P_mech >= 0:
  P_elec = (P_mech / drivetrain_efficiency) + P_aux
If P_mech < 0:
  P_elec = max(P_mech * regen_efficiency, -1500W) + P_aux

Effective_Power = P_elec * traffic_factor * temp_derate_factor
```

### 5.2 Charger Trust Score Formula
```
Freshness Weight (w_fresh) = exp(-status_age_minutes / 45)
Historical Prior (p_hist)  = (successes + 1) / (successes + failures + 2)
P_usable_blended           = w_fresh * p_status + (1 - w_fresh) * p_hist
P_usable_net               = P_usable_blended - occupancy_penalty - fault_penalty
Trust_Score                = round(100 * lower_confidence_bound(P_usable_net))
```

---

## 6. Scientific Honesty & Data Provenance

| Entity | Provenance | Notes |
|---|---|---|
| Reference Ola S1 Z (3.1 & 5.1 kWh) | `REAL` | Claimed brochure values from user-supplied reference; not independently validated. |
| Coimbatore Geospatial Routes | `PUBLIC` | Public coordinate paths from Gandhipuram to Anaikatti foothills. |
| Charger Station Telemetry | `SIMULATED` | Labelled simulator with realistic heartbeat decay latencies. |
| In-Flight BMS Stream | `SIMULATED` | 40-minute synthetic telemetry with cell temperature noise. |
| 120-Trip Evaluation Benchmark | `SIMULATED` | Seeded complete-trip held-out split. |

**Mandatory Statement:** *"Concept prototype. No OEM partnership, live charger integration or validated vehicle performance is claimed."*

---

## 7. Commercial Pathway Roadmap

- **Phase 1 (Q1 2027):** B2B Last-Mile Delivery Fleets — Dispatch risk scoring API for commercial 2W/3W cargo operations.
- **Phase 2 (Q3 2027):** CPO Roaming Trust Integration — Direct OCPI 2.2.1 telemetry adapters with Indian charge point operators.
- **Phase 3 (Q1 2028):** Embedded OEM Instrument Cluster SDK — Native Linux / Android Automotive integration.
- **Phase 4 (Q4 2028):** Battery Swap Station Diagnostic Screening — Automated cabinet latch interlocks for two-wheeler exchange stations.

---

## 8. Built for HackFront India

Engineered with precision for **HackFront India 2026** by the VoltSure mobility engineering team.
