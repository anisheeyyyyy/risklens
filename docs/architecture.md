# RISK LENS — System Architecture Documentation

## 1. System Overview

**RISK LENS** is an enterprise-grade defensive cybersecurity risk management and posture orchestration platform. It continuously aggregates asset discovery data, vulnerability telemetry, threat intelligence signals, and security events to compute an explainable, weighted enterprise cyber risk score. It coordinates 10 single-responsibility agentic AI micro-services connected to a human-in-the-loop approval gate for sensitive containment and remediation actions.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                 FRONTEND CLIENT (React 18 + TypeScript + Vite)                     |
|  - Enterprise Dark Theme (Navy/Charcoal #0B0F19, Cyan Accent #06B6D4, Semantic Severity Colors)  |
|  - Dashboard: Radial Risk Gauge, Recharts Trend Line, Factor Breakdown, Live Telemetry Stream     |
|  - Modules: Assets, Vulnerabilities, Threats, AI Insights, Alerts, Reports, Settings             |
|  - Interactive Human Approval Gate for Sensitive Agent Tasks                                      |
+-------------------------------------------------+-------------------------------------------------+
                                                  | JSON REST API Requests
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                 BACKEND API (Node.js + Express + TypeScript)                      |
|  - Strict Response Envelope: { success: boolean, data?: T, error?: { message, code } }           |
|  - Input Validation via Zod Schemas                                                              |
|  - Structured Error & Audit Logging Middleware                                                    |
+-------------------+-----------------------------+-----------------------------+-------------------+
                    |                             |                             |
                    v                             v                             v
+-----------------------+     +-----------------------+     +---------------------------------------+
|  DATABASE LAYER       |     |  CYBER RISK ENGINE    |     |  AGENTIC AI ORCHESTRATION PIPELINE     |
|  - PostgreSQL (pg)    |     |  - 5-Factor Formula   |     |  1. Risk Detection Agent              |
|  - In-Memory Fallback |     |  - Normalization      |     |  2. Threat Investigation Agent        |
|  - Parameterized SQL  |     |  - Factor Breakdown   |     |  3. Risk Prioritization Agent         |
|  - 12 Core Tables     |     |  - History Tracking   |     |  4. Vulnerability Remediation Agent   |
+-----------------------+     +-----------------------+     |  5. Threat Response Agent (Sensitive) |
                                                            |  6. Risk Forecasting Agent            |
                                                            |  7. Anomaly Detection Agent           |
                                                            |  8. Compliance Audit Agent            |
                                                            |  9. Security Report Agent             |
                                                            |  10. Verification Agent               |
                                                            +-------------------+-------------------+
                                                                                |
                                                                                v
                                                            +---------------------------------------+
                                                            | HUMAN-IN-THE-LOOP APPROVAL GATE       |
                                                            | - Pending Approval State              |
                                                            | - Action Execution upon Approval      |
                                                            | - Score Recalculation by Verification |
                                                            +---------------------------------------+
```

---

## 3. Core Architectural Principles

### 3.1 Defensive-Only Security Guardrails
RISK LENS is strictly an analytical, prioritization, and posture-hardening solution.
- **No Offensive Capabilities**: The system does not generate exploit payloads, offensive exploits, or active external penetration scanning scripts.
- **Controlled System Changes**: Sensitive changes to infrastructure (such as network isolation or credential revocation) require mandatory human approval (`POST /api/agents/tasks/:id/approve`).

### 3.2 Explainable 5-Factor Risk Scoring Engine
Enterprise risk is calculated dynamically using a 5-factor normalized mathematical model:

$$\text{RiskScore} = \text{Norm}\left(0.30 \cdot S_{\text{vuln}} + 0.20 \cdot S_{\text{asset}} + 0.25 \cdot S_{\text{threat}} + 0.15 \cdot S_{\text{event}} + 0.10 \cdot S_{\text{controls}}\right)$$

Where:
- $S_{\text{vuln}}$ (30%): Vulnerability severity and CVSS profile across unpatched flaws.
- $S_{\text{asset}}$ (20%): Criticality weighting of exposed assets vs total asset base.
- $S_{\text{threat}}$ (25%): Active threat campaigns, ransomware indicators, and APT signals.
- $S_{\text{event}}$ (15%): Security event velocity and telemetry volume in the trailing 24 hours.
- $S_{\text{controls}}$ (10%): Unacknowledged critical alerts and unhardened legacy systems.

Every score calculation produces a transparent `factor_breakdown` returned to the user interface.

### 3.3 Agentic Pipeline & Human-in-the-Loop Workflow

```
[Security Telemetry]
        │
        ▼
[Risk Detection Agent] ──▶ [Threat Investigation Agent]
        │
        ▼
[Risk Prioritization Agent]
        │
        ▼
[Threat Response Agent]
        │
        ▼
┌──────────────────────────────────────────────┐
│  HUMAN-IN-THE-LOOP APPROVAL GATE             │
│  State: pending_approval                     │
│  User Action: Approve / Reject via UI or API │
└──────────────────────┬───────────────────────┘
                       │ (Upon Approval)
                       ▼
[Action Execution & Quarantine]
        │
        ▼
[Verification Agent] ──▶ [Recalculate Cyber Risk Score] ──▶ [Update Historical Trend]
```

---

## 4. Technology Stack Summary

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript (Strict), Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, TypeScript (Strict), Zod validation, CORS, Dotenv |
| **Database** | PostgreSQL with native `pg` driver, parameterized SQL queries, embedded `pg-mem` fallback |
| **AI / Agents** | 10 Deterministic & Explainable TypeScript Agent modules + Central Orchestrator |
| **Security** | Strict API response shapes, parameter binding, audit logging, zero client-side credentials |
