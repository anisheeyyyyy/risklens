# RISK LENS — Database Design & Schema Specification

The database utilizes PostgreSQL with 12 core relational tables and 1 system configuration table. All primary keys use formatted unique string identifiers (`ast-001`, `vuln-001`, `usr-001`, etc.) for portability, clarity, and ease of cross-layer debugging.

---

## 1. Entity Relationship Overview

```
+---------------+        1:N        +-------------------+
|     USERS     | ----------------> |    AUDIT_LOGS     |
+---------------+                   +-------------------+
        |
        | 1:N (Acknowledge)
        v
+---------------+        N:1        +-------------------+
|    ALERTS     | <---------------- |      ASSETS       |
+---------------+                   +-------------------+
  |           |                       |               |
  | N:1       | N:1                   | 1:N           | 1:N
  v           v                       v               v
+-------+   +-------+         +----------------+   +---------------+
| VULNS |   |THREATS|         |VULNERABILITIES |   |    THREATS    |
+-------+   +-------+         +----------------+   +---------------+
                                      |                    |
                                      +----------+---------+
                                                 |
                                                 v
                                      +--------------------+
                                      |    AGENT_TASKS     | (Polymorphic)
                                      +--------------------+
                                                 | 1:N
                                                 v
                                      +--------------------+
                                      |   AGENT_ACTIONS    | (Approval Gate)
                                      +--------------------+
```

---

## 2. Table Specifications

### 1. `users`
- `id` (VARCHAR(64), PK)
- `email` (VARCHAR(255), UNIQUE)
- `full_name` (VARCHAR(255))
- `role` (VARCHAR(50))
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### 2. `assets`
- `id` (VARCHAR(64), PK)
- `name` (VARCHAR(255))
- `asset_type` (VARCHAR(64)) — `server`, `endpoint`, `cloud-resource`, `network-device`, `database`, `application`
- `ip_address` (VARCHAR(45))
- `hostname` (VARCHAR(255))
- `criticality` (VARCHAR(32)) — `Critical`, `High`, `Medium`, `Low`
- `owner` (VARCHAR(255))
- `status` (VARCHAR(32)) — `Active`, `Under Maintenance`, `Isolated`, `Decommissioned`
- `location` (VARCHAR(128))
- `tags` (TEXT[])
- `last_scanned_at` (TIMESTAMP WITH TIME ZONE)

### 3. `vulnerabilities`
- `id` (VARCHAR(64), PK)
- `cve_id` (VARCHAR(64)) — e.g. `CVE-2026-38412`
- `title` (VARCHAR(255))
- `description` (TEXT)
- `severity` (VARCHAR(32)) — `Critical`, `High`, `Medium`, `Low`
- `cvss_score` (NUMERIC(3,1))
- `asset_id` (VARCHAR(64), FK -> `assets.id`)
- `status` (VARCHAR(32)) — `Open`, `In Progress`, `Resolved`, `Risk Accepted`
- `remediation_guidance` (TEXT)
- `remediation_priority` (VARCHAR(32)) — `P0 - Immediate`, `P1 - High`, `P2 - Moderate`, `P3 - Low`
- `discovered_at`, `patched_at` (TIMESTAMP WITH TIME ZONE)

### 4. `threats`
- `id` (VARCHAR(64), PK)
- `threat_name` (VARCHAR(255))
- `threat_type` (VARCHAR(64))
- `severity` (VARCHAR(32))
- `source` (VARCHAR(255))
- `asset_id` (VARCHAR(64), FK -> `assets.id`)
- `status` (VARCHAR(32)) — `Active`, `Investigating`, `Mitigated`, `Contained`, `Dismissed`
- `indicator_of_compromise` (TEXT)
- `tactics_techniques` (TEXT[]) — MITRE ATT&CK codes
- `description` (TEXT)
- `detected_at`, `mitigated_at` (TIMESTAMP WITH TIME ZONE)

### 5. `alerts`
- `id` (VARCHAR(64), PK)
- `title` (VARCHAR(255))
- `description` (TEXT)
- `severity` (VARCHAR(32))
- `source_type` (VARCHAR(64)) — `vulnerability`, `threat`, `security_event`, `system`
- `asset_id` (VARCHAR(64), FK -> `assets.id`)
- `vulnerability_id` (VARCHAR(64), FK -> `vulnerabilities.id`, Nullable)
- `threat_id` (VARCHAR(64), FK -> `threats.id`, Nullable)
- `security_event_id` (VARCHAR(64), FK -> `security_events.id`, Nullable)
- `status` (VARCHAR(32)) — `Open`, `Acknowledged`, `Resolved`, `Dismissed`
- `acknowledged_by` (VARCHAR(64), FK -> `users.id`)

### 6. `risk_scores`
- `id` (VARCHAR(64), PK)
- `overall_score` (NUMERIC(5,2)) — 0.00 to 100.00
- `risk_level` (VARCHAR(32)) — `Low`, `Moderate`, `High`, `Critical`
- `vuln_severity_score` (NUMERIC(5,2))
- `asset_criticality_score` (NUMERIC(5,2))
- `threat_exposure_score` (NUMERIC(5,2))
- `security_event_score` (NUMERIC(5,2))
- `controls_gap_score` (NUMERIC(5,2))
- `factor_breakdown` (JSONB)
- `recorded_at` (TIMESTAMP WITH TIME ZONE)

### 7. `agent_tasks` & `agent_actions`
- `agent_tasks`: Tracks each run of all 10 agents, including polymorphic link (`related_entity_type`, `related_entity_id`), inputs/outputs, and whether human authorization is required.
- `agent_actions`: Captures discrete actionable countermeasures (`Isolate Asset`, `Apply Virtual Patch`, etc.) with approval lifecycle (`pending_approval` -> `approved` / `rejected` -> `executed` -> `verified`).

### 8. Additional Tables
- `security_events`: High-throughput security telemetry.
- `security_scans`: Audit history of automated vulnerability / perimeter scans.
- `ai_insights`: AI narrative summaries, posture forecasts, and recommendations.
- `audit_logs`: Immutable audit trail of all analyst and agent activities.
- `system_settings`: Enterprise thresholds, autonomous agent toggles, and notification preferences.
