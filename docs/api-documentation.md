# RISK LENS — REST API Documentation

All API responses follow a uniform JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

In case of error:
```json
{
  "success": false,
  "error": {
    "message": "Detailed error message",
    "code": "ERROR_CODE"
  }
}
```

---

## 1. Dashboard API

### `GET /api/dashboard`
Fetches all aggregated high-level security metrics, active counts, risk score, factor breakdown, recent security events feed, and active alerts.

**Response Structure (`data`):**
```json
{
  "stats": {
    "totalAssets": 20,
    "criticalAssets": 6,
    "totalVulnerabilities": 42,
    "criticalVulnerabilities": 5,
    "highVulnerabilities": 10,
    "activeThreats": 7,
    "securityHealth": 68.5,
    "openAlerts": 14,
    "criticalAlerts": 4
  },
  "riskScore": {
    "overall_score": 72.4,
    "risk_level": "High",
    "vuln_severity_score": 78.2,
    "asset_criticality_score": 82.0,
    "threat_exposure_score": 74.5,
    "security_event_score": 60.0,
    "controls_gap_score": 55.0,
    "factor_breakdown": [ ... ]
  },
  "recentEvents": [ ... ],
  "activeAlerts": [ ... ],
  "recentAgentTasks": [ ... ]
}
```

---

## 2. Asset Management

### `GET /api/assets`
Query parameters: `asset_type`, `criticality`, `status`, `search`.

### `POST /api/assets`
Create a new asset.
```json
{
  "name": "DEMO-NEW-SERVER-01",
  "asset_type": "server",
  "ip_address": "10.100.5.25",
  "hostname": "new-srv.corp.internal",
  "criticality": "High",
  "owner": "Cloud Infrastructure",
  "location": "AWS us-east-1",
  "tags": ["prod", "api"]
}
```

### `GET /api/assets/:id`
Retrieves single asset details with linked vulnerabilities and threats.

### `PUT /api/assets/:id`
Updates asset fields (e.g. status, criticality, tags).

### `DELETE /api/assets/:id`
Removes an asset from inventory.

---

## 3. Vulnerability Management

### `GET /api/vulnerabilities`
Query parameters: `severity`, `status`, `asset_id`, `search`.

### `POST /api/vulnerabilities`
Registers a new CVE vulnerability finding.

### `PUT /api/vulnerabilities/:id`
Updates status (`Open`, `In Progress`, `Resolved`, `Risk Accepted`) or remediation notes.

---

## 4. Threat Intelligence

### `GET /api/threats`
Query parameters: `severity`, `status`, `threat_type`, `search`.

### `POST /api/threats`
Registers a new active threat campaign.

### `PUT /api/threats/:id`
Updates threat investigation state or containment status.

---

## 5. Alerts & Incidents

### `GET /api/alerts`
Query parameters: `severity`, `status`, `source_type`.

### `PUT /api/alerts/:id`
Updates alert state (e.g., `Acknowledged`, `Resolved`).

---

## 6. Cyber Risk Scoring

### `GET /api/risk-score`
Returns the current dynamic 5-factor risk score and historical records for trend charts.

### `POST /api/risk-score/recalculate`
Forces a re-evaluation across all database entities and records a new historical score snapshot.

---

## 7. AI & Agent Orchestration

### `GET /api/ai/insights`
Returns explainable security insights, forecasts, and automated recommendations.

### `POST /api/ai/analyze`
Triggers immediate AI posture evaluation.

### `GET /api/agents/tasks`
Lists all executed, in-progress, and pending agent tasks with associated actions.

### `POST /api/agents/run`
Executes the multi-agent detection, investigation, and prioritization orchestrator.
Returns pipeline run outcome, step summaries, and any generated sensitive action awaiting human approval.

### `POST /api/agents/tasks/:id/approve`
**Human-in-the-Loop Approval Gate**: Authorizes and executes a sensitive containment action, updates affected assets/threats, executes the **Verification Agent**, and automatically recalculates the enterprise risk score.

### `POST /api/agents/tasks/:id/reject`
Rejects a pending agent action with an analyst review reason.

---

## 8. Security Reports

### `GET /api/reports`
Fetches all generated security reports.

### `POST /api/reports/generate`
Generates a new structured report via the Security Report Agent (`executive`, `vulnerability`, `threat`, `compliance`).

---

## 9. System Settings

### `GET /api/settings`
Retrieves global risk thresholds, agent autonomous flags, and organization profile.

### `PUT /api/settings`
Persists updated configuration settings.
