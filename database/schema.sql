-- ============================================================================
-- RISK LENS — Enterprise Cybersecurity Risk Management Platform
-- Database Schema (PostgreSQL)
-- ============================================================================

-- Extensions (Not needed for VARCHAR primary keys)

-- Drop existing tables in reverse dependency order for clean migrations
DROP TABLE IF EXISTS agent_actions CASCADE;
DROP TABLE IF EXISTS agent_tasks CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS security_scans CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS risk_scores CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS threats CASCADE;
DROP TABLE IF EXISTS vulnerabilities CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SecOps Analyst',
    avatar_url TEXT,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 1.5. PASSWORD RESET TOKENS
-- ----------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. ASSETS
-- ----------------------------------------------------------------------------
CREATE TABLE assets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(64) NOT NULL, -- 'server', 'endpoint', 'cloud-resource', 'network-device', 'database', 'application', 'firewall'
    ip_address VARCHAR(45),
    hostname VARCHAR(255),
    criticality VARCHAR(32) NOT NULL DEFAULT 'Medium', -- 'Critical', 'High', 'Medium', 'Low' — CALCULATED, not user-set
    owner VARCHAR(255) NOT NULL DEFAULT 'SecOps Infrastructure Team',
    status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active', 'Under Maintenance', 'Isolated', 'Decommissioned'
    -- Risk assessment attributes (user-provided at creation)
    environment VARCHAR(32) DEFAULT 'Production',           -- 'Production', 'Staging', 'Development', 'DR'
    internet_exposed BOOLEAN DEFAULT FALSE,
    contains_sensitive_data BOOLEAN DEFAULT FALSE,
    business_importance VARCHAR(32) DEFAULT 'Medium',       -- 'Critical', 'High', 'Medium', 'Low'
    -- Calculated risk output
    risk_score NUMERIC(5,2) DEFAULT 0,
    risk_level VARCHAR(32) DEFAULT 'Low',                   -- 'Critical', 'High', 'Medium', 'Low'
    -- Type-specific technical identification fields
    cloud_provider VARCHAR(64),
    region VARCHAR(64),
    resource_id VARCHAR(255),
    database_type VARCHAR(64),
    port INTEGER,
    operating_system VARCHAR(64),
    management_ip_address VARCHAR(45),
    network_zone VARCHAR(64),
    application_url TEXT,
    -- Metadata
    location VARCHAR(128) DEFAULT 'us-east-1 (Primary VPC)',
    tags TEXT[] DEFAULT '{}',
    last_scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_criticality ON assets(criticality);
CREATE INDEX idx_assets_status ON assets(status);

-- ----------------------------------------------------------------------------
-- 3. VULNERABILITIES
-- ----------------------------------------------------------------------------
CREATE TABLE vulnerabilities (
    id VARCHAR(64) PRIMARY KEY,
    cve_id VARCHAR(64) NOT NULL, -- e.g. 'CVE-2026-21448'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    cvss_score NUMERIC(3, 1) NOT NULL, -- e.g. 9.8
    asset_id VARCHAR(64) NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Risk Accepted'
    remediation_guidance TEXT,
    remediation_priority VARCHAR(32) DEFAULT 'P1', -- 'P0 - Immediate', 'P1 - High', 'P2 - Moderate', 'P3 - Low'
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    patched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vuln_asset_id ON vulnerabilities(asset_id);
CREATE INDEX idx_vuln_severity ON vulnerabilities(severity);
CREATE INDEX idx_vuln_status ON vulnerabilities(status);
CREATE INDEX idx_vuln_cve_id ON vulnerabilities(cve_id);

-- ----------------------------------------------------------------------------
-- 4. THREATS
-- ----------------------------------------------------------------------------
CREATE TABLE threats (
    id VARCHAR(64) PRIMARY KEY,
    threat_name VARCHAR(255) NOT NULL,
    threat_type VARCHAR(64) NOT NULL, -- 'Ransomware Activity', 'Lateral Movement', 'Credential Dumping', 'Data Exfiltration', 'DDoS Campaign', 'Zero-Day Exploit'
    severity VARCHAR(32) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    source VARCHAR(255) NOT NULL, -- Threat source or actor moniker e.g. 'APT-29 Correlated Feeds', 'External Perimeter Probe'
    asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active', 'Investigating', 'Mitigated', 'Contained', 'Dismissed'
    indicator_of_compromise TEXT, -- IP, hash, or suspicious domain
    tactics_techniques TEXT[] DEFAULT '{}', -- MITRE ATT&CK codes e.g. 'T1059', 'T1078'
    description TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mitigated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_threats_asset_id ON threats(asset_id);
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_threats_status ON threats(status);

-- ----------------------------------------------------------------------------
-- 5. SECURITY EVENTS (Raw telemetry / event stream)
-- ----------------------------------------------------------------------------
CREATE TABLE security_events (
    id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL, -- 'Auth Failure', 'Privilege Escalation Attempt', 'Port Scan Detected', 'Outbound Data Spike', 'TLS Certificate Mismatch'
    severity VARCHAR(32) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low', 'Info'
    source_ip VARCHAR(45),
    target_asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE SET NULL,
    raw_data JSONB DEFAULT '{}'::jsonb,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sec_events_target_asset ON security_events(target_asset_id);
CREATE INDEX idx_sec_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX idx_sec_events_severity ON security_events(severity);

-- ----------------------------------------------------------------------------
-- 6. ALERTS
-- ----------------------------------------------------------------------------
CREATE TABLE alerts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    source_type VARCHAR(64) NOT NULL, -- 'vulnerability', 'threat', 'security_event', 'system'
    asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE CASCADE,
    vulnerability_id VARCHAR(64) REFERENCES vulnerabilities(id) ON DELETE SET NULL,
    threat_id VARCHAR(64) REFERENCES threats(id) ON DELETE SET NULL,
    security_event_id VARCHAR(64) REFERENCES security_events(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Open', -- 'Open', 'Acknowledged', 'Resolved', 'Dismissed'
    acknowledged_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_asset_id ON alerts(asset_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- ----------------------------------------------------------------------------
-- 7. RISK SCORES (Historical Snapshots & Realtime Factor Breakdowns)
-- ----------------------------------------------------------------------------
CREATE TABLE risk_scores (
    id VARCHAR(64) PRIMARY KEY,
    overall_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    risk_level VARCHAR(32) NOT NULL, -- 'Low', 'Moderate', 'High', 'Critical'
    vuln_severity_score NUMERIC(5, 2) NOT NULL,
    asset_criticality_score NUMERIC(5, 2) NOT NULL,
    threat_exposure_score NUMERIC(5, 2) NOT NULL,
    security_event_score NUMERIC(5, 2) NOT NULL,
    controls_gap_score NUMERIC(5, 2) NOT NULL,
    factor_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_scores_recorded_at ON risk_scores(recorded_at DESC);

-- ----------------------------------------------------------------------------
-- 8. AI INSIGHTS
-- ----------------------------------------------------------------------------
CREATE TABLE ai_insights (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    insight_type VARCHAR(64) NOT NULL, -- 'Risk Trend', 'Threat Posture', 'Remediation Forecast', 'Compliance Gap', 'Anomaly Spike'
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 0.92,
    recommended_action TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'Security Posture',
    is_actionable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. SECURITY SCANS
-- ----------------------------------------------------------------------------
CREATE TABLE security_scans (
    id VARCHAR(64) PRIMARY KEY,
    scan_type VARCHAR(64) NOT NULL, -- 'Vulnerability Scan', 'Cloud Config Audit', 'Perimeter Port Scan', 'IAM Policy Check'
    status VARCHAR(32) NOT NULL DEFAULT 'Completed', -- 'Pending', 'Running', 'Completed', 'Failed'
    target_asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE SET NULL,
    findings_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    scan_summary JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sec_scans_target_asset ON security_scans(target_asset_id);

-- ----------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 11. AGENT TASKS (Polymorphic references & approval requirement)
-- ----------------------------------------------------------------------------
CREATE TABLE agent_tasks (
    id VARCHAR(64) PRIMARY KEY,
    agent_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'pending_approval', 'rejected', 'failed'
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    related_entity_type VARCHAR(64), -- 'asset', 'vulnerability', 'threat', 'security_event', 'overall_posture'
    related_entity_id VARCHAR(64),
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_agent_tasks_agent_name ON agent_tasks(agent_name);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

-- ----------------------------------------------------------------------------
-- 12. AGENT ACTIONS (Executable response actions with approval workflow)
-- ----------------------------------------------------------------------------
CREATE TABLE agent_actions (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    action_type VARCHAR(128) NOT NULL, -- 'Isolate Asset', 'Apply Virtual Patch', 'Revoke Compromised Token', 'Update Firewall Rule', 'Re-score Risk'
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'rejected', 'executed', 'verified'
    approved_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    result_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_actions_task_id ON agent_actions(task_id);
CREATE INDEX idx_agent_actions_status ON agent_actions(status);

-- ----------------------------------------------------------------------------
-- 13. SYSTEM SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE system_settings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
    org_name VARCHAR(255) NOT NULL DEFAULT 'Acme Global Defense Operations',
    contact_email VARCHAR(255) NOT NULL DEFAULT 'security-lead@acme-defense.demo',
    risk_threshold_critical INT NOT NULL DEFAULT 80,
    risk_threshold_high INT NOT NULL DEFAULT 60,
    risk_threshold_medium INT NOT NULL DEFAULT 30,
    auto_approval_low_risk BOOLEAN NOT NULL DEFAULT FALSE,
    enable_threat_intel_stream BOOLEAN NOT NULL DEFAULT TRUE,
    enable_realtime_anomalies BOOLEAN NOT NULL DEFAULT TRUE,
    enable_scheduled_verification BOOLEAN NOT NULL DEFAULT TRUE,
    notification_slack_webhook TEXT DEFAULT '',
    notification_email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    demo_mode BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
