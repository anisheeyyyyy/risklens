-- ============================================================================
-- RISK LENS — Enterprise Cybersecurity Risk Management Platform
-- Seed Data (Synthetic Demonstration Dataset)
-- ============================================================================
-- IMPORTANT NOTICE:
-- This is synthetic demonstration data. It does not represent any real
-- organization, real vulnerability disclosure, or real security incident.
-- All IP addresses, hostnames, and identifiers are generated for testing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, full_name, role, avatar_url) VALUES
('usr-001', 'elena.rostova@acme-defense.demo', 'Elena Rostova', 'Chief Information Security Officer (CISO)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('usr-002', 'marcus.vance@acme-defense.demo', 'Marcus Vance', 'Lead SecOps Analyst', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('usr-003', 'sarah.chen@acme-defense.demo', 'Sarah Chen', 'Threat Intelligence Specialist', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
('usr-004', 'david.okonkwo@acme-defense.demo', 'David Okonkwo', 'Cloud Security Architect', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. ASSETS (20 mixed assets)
-- ----------------------------------------------------------------------------
INSERT INTO assets (id, name, asset_type, ip_address, hostname, criticality, owner, status, location, tags, last_scanned_at) VALUES
('ast-001', 'DEMO-PROD-API-GW-01', 'server', '10.100.4.12', 'api-gw-01.us-east.corp.internal', 'Critical', 'Platform Engineering', 'Active', 'AWS us-east-1', ARRAY['prod', 'pci-dss', 'public-facing', 'api-gateway'], NOW() - INTERVAL '2 hours'),
('ast-002', 'DEMO-PROD-CORE-DB-PRIMARY', 'database', '10.100.12.50', 'pg-cluster-01.prod.corp.internal', 'Critical', 'Database Reliability Team', 'Active', 'AWS us-east-1 (Private Subnet)', ARRAY['prod', 'pci-dss', 'sensitive-data', 'postgresql'], NOW() - INTERVAL '1 hour'),
('ast-003', 'DEMO-KUBE-CLUSTER-PROD', 'cloud-resource', '10.100.30.1', 'k8s-control-plane.prod.corp.internal', 'Critical', 'DevOps Team', 'Active', 'AWS us-east-1 (EKS)', ARRAY['prod', 'kubernetes', 'container-runtime'], NOW() - INTERVAL '4 hours'),
('ast-004', 'DEMO-AUTH-KEYCLOAK-01', 'application', '10.100.4.88', 'idp-sso.auth.corp.internal', 'Critical', 'Identity & Access Management', 'Active', 'AWS us-east-1', ARRAY['prod', 'iam', 'oauth2', 'sso'], NOW() - INTERVAL '3 hours'),
('ast-005', 'DEMO-EDGE-FIREWALL-PALO', 'network-device', '198.51.100.2', 'fw-edge-01.perimeter.corp.internal', 'Critical', 'Network SecOps', 'Active', 'Equinix DC-01 (Border)', ARRAY['perimeter', 'firewall', 'ngfw'], NOW() - INTERVAL '30 minutes'),
('ast-006', 'DEMO-CUSTOMER-PORTAL-WEB', 'application', '10.100.8.20', 'portal.acme-defense.demo', 'High', 'Frontend Web Team', 'Active', 'AWS us-east-1 (CloudFront Origin)', ARRAY['prod', 'web', 'public-facing', 'react-spa'], NOW() - INTERVAL '5 hours'),
('ast-007', 'DEMO-PAYMENT-INGEST-SVC', 'application', '10.100.14.99', 'pay-gateway-svc.prod.corp.internal', 'Critical', 'FinTech Squad', 'Active', 'AWS us-east-1', ARRAY['prod', 'pci-dss', 'payments'], NOW() - INTERVAL '2 hours'),
('ast-008', 'DEMO-REDIS-CACHE-CLUSTER', 'database', '10.100.12.75', 'redis-prod-01.corp.internal', 'Medium', 'Platform Engineering', 'Active', 'AWS us-east-1', ARRAY['prod', 'in-memory', 'cache'], NOW() - INTERVAL '8 hours'),
('ast-009', 'DEMO-LOG-AGGREGATOR-ELK', 'server', '10.100.40.10', 'siem-elastic-01.corp.internal', 'High', 'SecOps Infrastructure Team', 'Active', 'AWS us-east-1', ARRAY['monitoring', 'siem', 'audit-logging'], NOW() - INTERVAL '6 hours'),
('ast-010', 'DEMO-CORP-VPN-CONCENTRATOR', 'network-device', '198.51.100.15', 'vpn-gw-hq.corp.internal', 'High', 'IT Operations', 'Active', 'HQ Corporate Office', ARRAY['perimeter', 'remote-access', 'ipsec'], NOW() - INTERVAL '4 hours'),
('ast-011', 'DEMO-CI-CD-JENKINS-RUNNER', 'server', '10.200.2.14', 'build-runner-04.devops.corp.internal', 'Medium', 'DevOps Team', 'Active', 'AWS us-east-2', ARRAY['cicd', 'automation', 'build-cluster'], NOW() - INTERVAL '12 hours'),
('ast-012', 'DEMO-DEV-SANDBOX-CLUSTER', 'cloud-resource', '10.200.80.5', 'eks-sandbox-dev.corp.internal', 'Low', 'Developer Experience', 'Active', 'AWS us-east-2', ARRAY['dev', 'sandbox', 'low-tier'], NOW() - INTERVAL '1 day'),
('ast-013', 'DEMO-HR-WORKDAY-CONNECTOR', 'application', '10.100.60.22', 'hris-sync.corp.internal', 'Medium', 'Corporate IT', 'Active', 'Azure East US', ARRAY['internal-tools', 'hr', 'pii'], NOW() - INTERVAL '10 hours'),
('ast-014', 'DEMO-BACKUP-S3-GATEWAY', 'cloud-resource', '10.100.90.10', 's3-privatelink.corp.internal', 'High', 'Storage Architecture', 'Active', 'AWS us-east-1', ARRAY['storage', 'disaster-recovery', 'backups'], NOW() - INTERVAL '7 hours'),
('ast-015', 'DEMO-EXECUTIVE-LAPTOP-01', 'endpoint', '192.168.1.105', 'ciso-macbook-pro.corp.internal', 'High', 'Executive IT Support', 'Active', 'Remote / US-West', ARRAY['endpoint', 'macos', 'edr-active', 'executive'], NOW() - INTERVAL '1 hour'),
('ast-016', 'DEMO-ANALYST-WORKSTATION-08', 'endpoint', '192.168.1.144', 'secops-ws-08.corp.internal', 'Medium', 'SecOps Operations', 'Active', 'HQ Security Operations Center', ARRAY['endpoint', 'windows-11', 'edr-active'], NOW() - INTERVAL '3 hours'),
('ast-017', 'DEMO-STAGING-API-SVC', 'server', '10.200.4.15', 'api-staging.corp.internal', 'Low', 'Backend Services Team', 'Active', 'AWS us-east-2', ARRAY['staging', 'pre-prod'], NOW() - INTERVAL '18 hours'),
('ast-018', 'DEMO-LEGACY-FILE-SERVER-SMB', 'server', '10.100.110.4', 'smb-nas-archive.corp.internal', 'High', 'Storage Architecture', 'Under Maintenance', 'Equinix DC-01', ARRAY['legacy', 'storage', 'smb-v2'], NOW() - INTERVAL '2 days'),
('ast-019', 'DEMO-CORE-SWITCH-ARISTA', 'network-device', '10.100.0.1', 'sw-core-spine-01.corp.internal', 'Critical', 'Network SecOps', 'Active', 'Equinix DC-01', ARRAY['network', 'core-routing', 'bgp'], NOW() - INTERVAL '1 hour'),
('ast-020', 'DEMO-DNS-RESOLVER-INTERNAL', 'server', '10.100.0.53', 'dns-ns1.corp.internal', 'High', 'Network SecOps', 'Active', 'AWS us-east-1', ARRAY['dns', 'infrastructure', 'bind9'], NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. VULNERABILITIES (42 realistic synthetic CVE items)
-- ----------------------------------------------------------------------------
INSERT INTO vulnerabilities (id, cve_id, title, description, severity, cvss_score, asset_id, status, remediation_guidance, remediation_priority, discovered_at) VALUES
-- Critical Vulns (CVSS >= 9.0)
('vuln-001', 'CVE-2026-38412', 'Unauthenticated Remote Code Execution in API Gateway Filter', 'Improper input validation in upstream HTTP header parsing logic allows arbitrary shell command execution via crafted hop-by-hop headers.', 'Critical', 9.8, 'ast-001', 'Open', 'Apply vendor patch v4.12.3 or deploy WAF inspection rule filtering malformed X-Forwarded-Host headers.', 'P0 - Immediate', NOW() - INTERVAL '1 day'),
('vuln-002', 'CVE-2026-29104', 'Kubernetes API Server Elevation of Privilege via Aggregate API', 'Flaw in token authentication handler allows authenticated low-privilege pods to forge cluster-admin RBAC claims.', 'Critical', 9.6, 'ast-003', 'In Progress', 'Upgrade kube-apiserver to v1.31.2 and restrict anonymous service account token mounting.', 'P0 - Immediate', NOW() - INTERVAL '2 days'),
('vuln-003', 'CVE-2026-17482', 'PostgreSQL Wire Protocol Authentication Bypass via TLS Renegotiation', 'Memory boundary corruption during SSL renegotiation allows bypassing password verification on specific SSL ciphers.', 'Critical', 9.1, 'ast-002', 'Open', 'Enforce SSL version minimum TLSv1.3 and patch pg cluster binaries to current maintenance release.', 'P0 - Immediate', NOW() - INTERVAL '8 hours'),
('vuln-004', 'CVE-2026-44190', 'SSO Identity Provider SAML Assertion Signature Wrapping (XSW)', 'Improper XML schema verification allows assertion signature forgery leading to full account takeover.', 'Critical', 9.4, 'ast-004', 'Open', 'Update Keycloak IdP library to release 24.8.1 and enforce Strict XML Signature Validation.', 'P0 - Immediate', NOW() - INTERVAL '16 hours'),
('vuln-005', 'CVE-2026-11849', 'Legacy SMBv2 Remote Memory Corruption Exploit', 'Malformed SMB negotiation packet triggers kernel pool buffer overrun permitting arbitrary kernel-mode execution.', 'Critical', 9.8, 'ast-018', 'Open', 'Decommission legacy SMBv2 protocol entirely; isolate host on VLAN 99 with zero egress.', 'P0 - Immediate', NOW() - INTERVAL '3 days'),

-- High Vulns (CVSS 7.0 - 8.9)
('vuln-006', 'CVE-2026-22415', 'SQL Injection in Payment Settlement Reporting Query', 'Unsanitized tenant parameter in reconciliation reporting endpoint permits arbitrary database read.', 'High', 8.5, 'ast-007', 'In Progress', 'Refactor query builder to use parameterized prepared statements and add query validation filter.', 'P1 - High', NOW() - INTERVAL '18 hours'),
('vuln-007', 'CVE-2026-31089', 'NextGen Firewall Admin Portal Reflected Cross-Site Scripting & Session Fixation', 'Management UI fails to sanitize status query string params, allowing session cookie extraction.', 'High', 7.9, 'ast-005', 'Open', 'Restrict Admin Portal access exclusively to dedicated management OOB network and update firmware.', 'P1 - High', NOW() - INTERVAL '2 days'),
('vuln-008', 'CVE-2026-19401', 'Elasticsearch Groovy Sandbox Escape via Dynamic Scripting', 'Improper restriction of dynamic script compilation permits execution of system commands in context of elastic user.', 'High', 8.2, 'ast-009', 'Open', 'Disable dynamic scripting in elasticsearch.yml and enforce read-only cluster role permissions.', 'P1 - High', NOW() - INTERVAL '4 days'),
('vuln-009', 'CVE-2026-28490', 'VPN Concentrator TLS Private Key Exposure via Side-Channel Timing', 'Cache timing vulnerability during RSA decryption allows recovering private host credentials over high volume probes.', 'High', 7.4, 'ast-010', 'Resolved', 'Rotate SSL gateway private keys and activate constant-time RSA decryption patch.', 'P1 - High', NOW() - INTERVAL '5 days'),
('vuln-010', 'CVE-2026-33921', 'Jenkins Script Security Plugin Sandbox Bypass', 'Unchecked AST transform in pipeline build definitions allows build executor to escape JVM containment.', 'High', 8.6, 'ast-011', 'Open', 'Update Script Security Plugin to v1280.v8e and enforce ephemeral single-use build containers.', 'P1 - High', NOW() - INTERVAL '1 day'),
('vuln-011', 'CVE-2026-40112', 'Customer Portal React Prototype Pollution via Deep Merge Utility', 'Object prototype pollution allows overwriting internal security flags leading to unauthorized admin view escalation.', 'High', 7.8, 'ast-006', 'In Progress', 'Upgrade Lodash / deepmerge dependencies to patched versions and apply JSON schema validation.', 'P1 - High', NOW() - INTERVAL '2 days'),
('vuln-012', 'CVE-2026-15984', 'Redis Unauthenticated Command Injection via Lua Debug Interface', 'Misconfigured eval interface exposes administrative commands over unprotected Redis port.', 'High', 8.1, 'ast-008', 'Open', 'Enforce AUTH password tokens and disable dangerous Lua debug primitives.', 'P1 - High', NOW() - INTERVAL '3 days'),
('vuln-013', 'CVE-2026-27103', 'BIND9 DNS Resolver Buffer Overrun during Recursive Processing', 'Crafted EDNS query with excessive option headers causes named daemon crash and potential memory corruption.', 'High', 7.5, 'ast-020', 'Resolved', 'Upgrade BIND9 package to 9.18.28-P1 on all name servers.', 'P1 - High', NOW() - INTERVAL '6 days'),
('vuln-014', 'CVE-2026-35198', 'Arista EOS Command Injection in Telemetry Streaming Agent', 'Unsanitized metric label in openconfig streaming parser enables arbitrary command execution as netadmin.', 'High', 8.4, 'ast-019', 'Open', 'Apply EOS hotfix release 4.31.2F-patch1 and enforce signed gRPC telemetry tokens.', 'P1 - High', NOW() - INTERVAL '1 day'),
('vuln-015', 'CVE-2026-14002', 'Azure HRIS Sync Insecure Direct Object Reference (IDOR)', 'Employee profile retrieval endpoint lacks authorization check allowing horizontal access across payroll records.', 'High', 7.7, 'ast-013', 'In Progress', 'Add ABAC (Attribute-Based Access Control) validator checking tenant_id on every profile query.', 'P1 - High', NOW() - INTERVAL '2 days'),

-- Medium Vulns (CVSS 4.0 - 6.9)
('vuln-016', 'CVE-2026-11204', 'Missing HTTP Strict Transport Security (HSTS) Preload Header', 'Web application does not include preload directive in HSTS response headers.', 'Medium', 5.3, 'ast-006', 'Open', 'Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload header.', 'P2 - Moderate', NOW() - INTERVAL '7 days'),
('vuln-017', 'CVE-2026-20491', 'Weak SSH Cipher Suites Enabled on Build Runners', 'SSH daemon supports CBC ciphers and diffie-hellman-group1-sha1 key exchanges.', 'Medium', 5.9, 'ast-011', 'Resolved', 'Reconfigure sshd_config to only allow curve25519-sha256 and chacha20-poly1305.', 'P2 - Moderate', NOW() - INTERVAL '4 days'),
('vuln-018', 'CVE-2026-30221', 'Excessive Information Disclosure in API Error Payloads', 'Stack traces and internal server IP addresses leaked in 500 Internal Server Error JSON bodies.', 'Medium', 6.2, 'ast-001', 'Open', 'Mask internal error objects in production mode and emit unique Correlation-IDs only.', 'P2 - Moderate', NOW() - INTERVAL '3 days'),
('vuln-019', 'CVE-2026-19302', 'Outdated OpenSSL 3.0 Sub-Dependency in Microservice Node Runtime', 'Node runtime utilizes OpenSSL 3.0.9 containing low-severity certificate parsing memory leak.', 'Medium', 5.1, 'ast-007', 'Open', 'Rebuild Docker base image with Node.js LTS 22.x series.', 'P2 - Moderate', NOW() - INTERVAL '5 days'),
('vuln-020', 'CVE-2026-25801', 'Unrestricted File Upload MIME-Type Validation Bypass', 'File upload filter only checks client-supplied Content-Type header without deep magic bytes inspection.', 'Medium', 6.7, 'ast-006', 'In Progress', 'Incorporate libmagic byte inspection and sanitize filenames before storing to S3.', 'P2 - Moderate', NOW() - INTERVAL '2 days'),
('vuln-021', 'CVE-2026-18774', 'CORS Misconfiguration Permitting Arbitrary Subdomain Reflection', 'Access-Control-Allow-Origin dynamically reflects any wildcard match against *.corp.internal.', 'Medium', 6.4, 'ast-004', 'Open', 'Enforce strict origin whitelist array instead of dynamic wildcard regex.', 'P2 - Moderate', NOW() - INTERVAL '8 days'),
('vuln-022', 'CVE-2026-29930', 'Staging Database Missing TLS Certificate Revocation Checking', 'Database client connection driver does not perform OCSP stapling verification for staging endpoints.', 'Medium', 4.8, 'ast-017', 'Open', 'Enable sslmode=verify-full with embedded CA chain.', 'P2 - Moderate', NOW() - INTERVAL '9 days'),
('vuln-023', 'CVE-2026-12108', 'macOS Local Privilege Escalation via Malformed LaunchDaemon plist', 'Permissions weakness in third-party diagnostic tool allows modifying service plist to gain root.', 'Medium', 6.8, 'ast-015', 'Resolved', 'Deploy Jamf MDM policy updating diagnostic agent to version 3.2.0.', 'P2 - Moderate', NOW() - INTERVAL '5 days'),
('vuln-024', 'CVE-2026-31994', 'Excessive AWS IAM Session Duration on S3 Gateway Role', 'Assumed role session maximum duration set to 12 hours instead of 1 hour recommended baseline.', 'Medium', 4.5, 'ast-014', 'Resolved', 'Reduce MaxSessionDuration to 3600 seconds in CloudFormation template.', 'P2 - Moderate', NOW() - INTERVAL '10 days'),
('vuln-025', 'CVE-2026-24155', 'Windows Workstation NTLMv1 Fallback Authentication Enabled', 'Legacy compatibility setting in Local Security Policy allows NTLMv1 challenge response.', 'Medium', 6.3, 'ast-016', 'Open', 'Enforce LMCompatibilityLevel=5 (NTLMv2 response only, refuse LM & NTLM) via Intune.', 'P2 - Moderate', NOW() - INTERVAL '3 days'),

-- Low Vulns (CVSS 0.1 - 3.9)
('vuln-026', 'CVE-2026-10022', 'Server Header Exposes Nginx Version String', 'HTTP response contains Server: nginx/1.24.0 disclosing exact version.', 'Low', 2.6, 'ast-001', 'Open', 'Configure server_tokens off in nginx.conf.', 'P3 - Low', NOW() - INTERVAL '12 days'),
('vuln-027', 'CVE-2026-10492', 'Missing Content-Security-Policy frame-ancestors Directive', 'Web portal does not specify frame-ancestors, potentially permitting UI clickjacking in older browsers.', 'Low', 3.4, 'ast-006', 'Open', 'Add Content-Security-Policy: frame-ancestors none to security headers middleware.', 'P3 - Low', NOW() - INTERVAL '11 days'),
('vuln-028', 'CVE-2026-10884', 'Robots.txt Discloses Non-Public Admin Endpoints', 'Disallow entries reveal internal route paths.', 'Low', 2.1, 'ast-006', 'Resolved', 'Remove sensitive route paths from robots.txt and rely on server-side 404 responses.', 'P3 - Low', NOW() - INTERVAL '14 days'),
('vuln-029', 'CVE-2026-11400', 'Cache-Control Header Missing on Static Asset Delivery', 'Static CSS and JS files served without explicit immutable caching directives.', 'Low', 1.8, 'ast-006', 'Resolved', 'Configure CloudFront distribution with Cache-Control: max-age=31536000, immutable.', 'P3 - Low', NOW() - INTERVAL '15 days'),
('vuln-030', 'CVE-2026-12903', 'Verbose TLS Cipher Suite Negotiation Logs', 'Debug logging level records partial handshake telemetry in non-sensitive log streams.', 'Low', 2.9, 'ast-010', 'Resolved', 'Set log level to INFO and filter cipher negotiation debug strings.', 'P3 - Low', NOW() - INTERVAL '13 days'),

-- Additional Mixed Vulns to exceed 40 items
('vuln-031', 'CVE-2026-45101', 'Dev Sandbox Unrestricted Ingress Security Group', 'Security group permits all traffic from 0.0.0.0/0 on port 8080.', 'High', 7.3, 'ast-012', 'In Progress', 'Restrict ingress CIDR to corporate VPN block 10.100.0.0/16.', 'P1 - High', NOW() - INTERVAL '1 day'),
('vuln-032', 'CVE-2026-46202', 'Kubernetes Pod Security Standards Not Enforced on Ingress Namespace', 'Namespace lacks pod-security.kubernetes.io/enforce=restricted label.', 'Medium', 5.6, 'ast-003', 'Open', 'Apply Kyverno policy requiring non-root execution and drop all Linux capabilities.', 'P2 - Moderate', NOW() - INTERVAL '4 days'),
('vuln-033', 'CVE-2026-47303', 'PostgreSQL Connection Pooling Exhaustion via Unbounded Idle Clients', 'Idle connection timeout not configured, permitting resource exhaustion DOS.', 'Medium', 6.0, 'ast-002', 'Open', 'Configure idle_in_transaction_session_timeout=60000 in postgresql.conf.', 'P2 - Moderate', NOW() - INTERVAL '2 days'),
('vuln-034', 'CVE-2026-48404', 'API Gateway Missing Rate Limiting on Authentication Routes', 'Route /api/v1/auth/login lacks TokenBucket rate limiting headers.', 'High', 7.6, 'ast-001', 'Open', 'Enable Envoy rate limit filter with max 10 requests/minute per client IP.', 'P1 - High', NOW() - INTERVAL '1 day'),
('vuln-035', 'CVE-2026-49505', 'Cloud S3 Bucket Missing Default Server-Side KMS Encryption', 'Bucket relies on SSE-S3 instead of customer-managed KMS key with key rotation.', 'Medium', 4.9, 'ast-014', 'In Progress', 'Enforce aws:kms encryption policy with aws/s3 alias.', 'P2 - Moderate', NOW() - INTERVAL '5 days'),
('vuln-036', 'CVE-2026-50606', 'Identity Provider Weak Password Complexity Policy', 'Password validator does not check against HaveIBeenPwned compromised dictionary.', 'Medium', 5.4, 'ast-004', 'Open', 'Activate password blacklist authenticator in Keycloak realm.', 'P2 - Moderate', NOW() - INTERVAL '3 days'),
('vuln-037', 'CVE-2026-51707', 'Elasticsearch Unencrypted Cluster Inter-Node Transport', 'Inter-node gossip communication runs over plaintext port 9300.', 'High', 7.1, 'ast-009', 'Open', 'Configure xpack.security.transport.ssl.enabled=true with internal PKI certs.', 'P1 - High', NOW() - INTERVAL '2 days'),
('vuln-038', 'CVE-2026-52808', 'Legacy File Server Weak SMB Signing Requirements', 'Client signing not required by default permitting relay attacks.', 'High', 7.5, 'ast-018', 'Open', 'Set RequireSecuritySignature=True on file server daemon.', 'P1 - High', NOW() - INTERVAL '4 days'),
('vuln-039', 'CVE-2026-53909', 'Customer Portal Missing Referrer-Policy Header', 'Browser leaks full URL query parameters in external referrer header.', 'Low', 3.1, 'ast-006', 'Open', 'Inject Referrer-Policy: strict-origin-when-cross-origin header.', 'P3 - Low', NOW() - INTERVAL '6 days'),
('vuln-040', 'CVE-2026-54010', 'Arista Switch SSH Root Login Enabled', 'PermitRootLogin yes configured on out-of-band management console.', 'High', 8.0, 'ast-019', 'In Progress', 'Disable root SSH login; enforce TACACS+ individual admin attribution.', 'P1 - High', NOW() - INTERVAL '1 day'),
('vuln-041', 'CVE-2026-55111', 'DevOps Jenkins Insecure Temporary File Creation in Build Scripts', 'Predictable temp paths in /tmp/build-* allow symlink race condition.', 'Medium', 5.8, 'ast-011', 'Open', 'Migrate scripts to mktemp -d with restrictive umask 077.', 'P2 - Moderate', NOW() - INTERVAL '4 days'),
('vuln-042', 'CVE-2026-56212', 'Endpoint Workstation Windows Defender Real-Time Protection Disabled via Group Policy', 'Local GPO override disabled real-time heuristic scanning engine.', 'High', 8.3, 'ast-016', 'In Progress', 'Re-apply Intune baseline security policy with Tamper Protection enabled.', 'P1 - High', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. THREATS (9 active synthetic threat items across MITRE tactics)
-- ----------------------------------------------------------------------------
INSERT INTO threats (id, threat_name, threat_type, severity, source, asset_id, status, indicator_of_compromise, tactics_techniques, description, detected_at) VALUES
('thr-001', 'APT-29 Correlated Reconnaissance & API Scanning', 'Zero-Day Exploit', 'Critical', 'Threat Intel Feed (CrowdStrike / Mandiant Feed)', 'ast-001', 'Investigating', '198.51.100.244 (Malicious AS39824), User-Agent: Custom-Python-Async', ARRAY['T1595 - Active Scanning', 'T1190 - Exploit Public-Facing App'], 'Automated reconnaissance campaign attempting hop-by-hop header injection against Edge API Gateway.', NOW() - INTERVAL '2 hours'),
('thr-002', 'Privilege Escalation Attempt on Production K8s Cluster', 'Lateral Movement', 'Critical', 'Kubernetes Audit Telemetry', 'ast-003', 'Active', 'Pod: dev-test-runner-88bc in namespace: default, Token ID: tok-88912', ARRAY['T1068 - Exploitation for Privilege Escalation', 'T1078 - Valid Accounts'], 'Service account from untrusted staging namespace attempted to bind cluster-admin role via aggregate API.', NOW() - INTERVAL '4 hours'),
('thr-003', 'Automated Credential Stuffing Campaign against SSO Portal', 'Credential Dumping', 'High', 'IdP Authentication Telemetry', 'ast-004', 'Mitigated', 'Distributed botnet: 45 distinct residential proxy IPs (AS14061)', ARRAY['T1110.004 - Credential Stuffing', 'T1078.004 - Cloud Accounts'], 'High velocity login attempts (14,200 requests/10 min) against Keycloak OAuth2 endpoint using leaked password hashes.', NOW() - INTERVAL '12 hours'),
('thr-004', 'Anomalous Outbound Data Transfer from Legacy Storage', 'Data Exfiltration', 'Critical', 'Network Flow Logs (Zeek / Suricata)', 'ast-018', 'Active', 'Dest IP: 203.0.113.88:443 (Unclassified External VPS), Transferred: 4.8 GB', ARRAY['T1048 - Exfiltration Over Alternative Protocol', 'T1071.001 - Web Protocols'], 'Sustained encrypted egress flow originating from legacy SMB archive server outside standard backup window.', NOW() - INTERVAL '6 hours'),
('thr-005', 'Ransomware Pre-Execution Telemetry on Analyst Workstation', 'Ransomware Activity', 'High', 'CrowdStrike Falcon EDR', 'ast-016', 'Investigating', 'SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855, vssadmin.exe shadow delete', ARRAY['T1486 - Data Encrypted for Impact', 'T1490 - Inhibit System Recovery'], 'Heuristic behavioral detection flagged execution of batch script attempting Volume Shadow Copy deletion.', NOW() - INTERVAL '14 hours'),
('thr-006', 'High-Volume Layer 7 DDoS Flood Targeting Payment Service', 'DDoS Campaign', 'High', 'Edge WAF Telemetry (Cloudflare Logs)', 'ast-007', 'Contained', 'Volumetric flood peak 120,000 req/sec from Mirai-variant IoT cluster', ARRAY['T1498 - Network Denial of Service', 'T1499 - Endpoint DoS'], 'Volumetric HTTP/2 rapid reset burst aimed at payment settlement endpoints; automated rate limiter engaged.', NOW() - INTERVAL '1 day'),
('thr-007', 'Unauthorized IAM Access Key Creation via CloudTrail', 'Lateral Movement', 'High', 'AWS CloudTrail Event Stream', 'ast-014', 'Mitigated', 'ARN: arn:aws:iam::123456789012:user/ci-deployer-backup, IP: 198.51.100.77', ARRAY['T1098 - Account Manipulation', 'T1078.004 - Cloud Accounts'], 'Backup service identity generated a secondary long-lived API key without required Jira ticket approval.', NOW() - INTERVAL '2 days'),
('thr-008', 'Internal Port Sweep Detected Across Private Subnet', 'Lateral Movement', 'Medium', 'Internal Intrusion Detection (Snort)', 'ast-011', 'Investigating', 'Source: 10.200.2.14, Target: 10.100.12.0/24 (Ports 5432, 6379, 22)', ARRAY['T1046 - Network Service Discovery'], 'CI build agent initiated SYN sweep across database subnets outside scheduled container test execution.', NOW() - INTERVAL '8 hours'),
('thr-009', 'Potential BGP Route Leak / Hijack Anomaly on Core Router', 'Zero-Day Exploit', 'Medium', 'Border BGP Telemetry', 'ast-019', 'Active', 'Peer AS64496 announced illegitimate /24 prefix cover', ARRAY['T1584 - Compromise Infrastructure', 'T1557 - Adversary-in-the-Middle'], 'Border router received invalid RPKI state announcement for corporate IP block from upstream transit.', NOW() - INTERVAL '10 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. SECURITY EVENTS (25 recent telemetry stream items)
-- ----------------------------------------------------------------------------
INSERT INTO security_events (id, event_type, severity, source_ip, target_asset_id, description, timestamp, raw_data) VALUES
('evt-001', 'Auth Failure', 'Critical', '198.51.100.244', 'ast-001', 'Repeated header injection payloads in HTTP POST /api/v1/auth', NOW() - INTERVAL '15 minutes', '{"method": "POST", "uri": "/api/v1/auth", "waf_rule_id": "WAF-941100"}'::jsonb),
('evt-002', 'Privilege Escalation Attempt', 'Critical', '10.100.30.1', 'ast-003', 'RBAC clusterrolebinding creation rejected by OPA Gatekeeper', NOW() - INTERVAL '35 minutes', '{"namespace": "default", "role": "cluster-admin", "user": "system:serviceaccount:default:runner"}'::jsonb),
('evt-003', 'Outbound Data Spike', 'Critical', '10.100.110.4', 'ast-018', 'Outbound connection transfer exceeded 4.8GB in 15min window to unverified external IP', NOW() - INTERVAL '50 minutes', '{"bytes_sent": 5153960755, "destination_ip": "203.0.113.88", "port": 443}'::jsonb),
('evt-004', 'Port Scan Detected', 'High', '198.51.100.180', 'ast-005', 'TCP SYN scan detected across 1024 ports within 12 seconds', NOW() - INTERVAL '1 hour', '{"ports_scanned": [21, 22, 23, 80, 443, 3389, 8080], "flags": "SYN"}'::jsonb),
('evt-005', 'TLS Certificate Mismatch', 'Medium', '10.100.4.88', 'ast-004', 'Client TLS handshake failed validation: expired intermediate authority', NOW() - INTERVAL '2 hours', '{"cipher": "ECDHE-RSA-AES128-GCM-SHA256", "error": "CERT_HAS_EXPIRED"}'::jsonb),
('evt-006', 'Auth Failure', 'High', '198.51.100.45', 'ast-004', '42 consecutive failed Kerberos/OAuth authentication attempts for root@corp.internal', NOW() - INTERVAL '2 hours', '{"account": "root@corp.internal", "attempts": 42}'::jsonb),
('evt-007', 'Privilege Escalation Attempt', 'High', '192.168.1.144', 'ast-016', 'Process vssadmin.exe attempted shadow storage deletion', NOW() - INTERVAL '3 hours', '{"parent_process": "cmd.exe", "command_line": "vssadmin delete shadows /all /quiet"}'::jsonb),
('evt-008', 'Outbound Data Spike', 'Medium', '10.100.12.50', 'ast-002', 'Nightly database WAL replication stream completed successfully', NOW() - INTERVAL '4 hours', '{"wal_size_mb": 1420, "replication_lag_ms": 12}'::jsonb),
('evt-009', 'Auth Failure', 'Low', '10.200.2.14', 'ast-011', 'Jenkins git clone failed with SSH public key rejection (expired key)', NOW() - INTERVAL '5 hours', '{"repo": "git@github.com:acme-defense/core-engine.git"}'::jsonb),
('evt-010', 'Port Scan Detected', 'Medium', '10.200.2.14', 'ast-002', 'CI runner triggered automated postgres connection check across port 5432', NOW() - INTERVAL '6 hours', '{"source": "jenkins-runner-04", "target": "pg-cluster-01"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. ALERTS (15 realistic alerts linked to vulns/threats/events)
-- ----------------------------------------------------------------------------
INSERT INTO alerts (id, title, description, severity, source_type, asset_id, vulnerability_id, threat_id, security_event_id, status, acknowledged_by, acknowledged_at) VALUES
('alt-001', 'Critical RCE Exposure on Edge API Gateway (CVE-2026-38412)', 'Active reconnaissance detected targeting unpatched API gateway header parsing vulnerability.', 'Critical', 'vulnerability', 'ast-001', 'vuln-001', 'thr-001', 'evt-001', 'Open', NULL, NULL),
('alt-002', 'Privilege Escalation in Kube Control Plane', 'Untrusted pod attempted unauthorized cluster-admin binding.', 'Critical', 'threat', 'ast-003', 'vuln-002', 'thr-002', 'evt-002', 'Open', NULL, NULL),
('alt-003', 'Data Exfiltration Alert: Abnormal Egress on Legacy File Server', 'Legacy SMB archive server transmitting high volumes to untrusted foreign IP address.', 'Critical', 'threat', 'ast-018', 'vuln-005', 'thr-004', 'evt-003', 'Open', NULL, NULL),
('alt-004', 'Ransomware Shadow Copy Deletion Blocked on Analyst Workstation', 'EDR intercepted and terminated malicious script attempting to destroy backup snapshots.', 'High', 'threat', 'ast-016', 'vuln-042', 'thr-005', 'evt-007', 'Acknowledged', 'usr-002', NOW() - INTERVAL '2 hours'),
('alt-005', 'PostgreSQL TLS Auth Bypass Risk (CVE-2026-17482)', 'Core financial database running unpatched TLS renegotiation build.', 'Critical', 'vulnerability', 'ast-002', 'vuln-003', NULL, NULL, 'Open', NULL, NULL),
('alt-006', 'SSO Assertion XML Signature Wrapping Vulnerability', 'Keycloak identity provider vulnerable to forged SAML tokens.', 'High', 'vulnerability', 'ast-004', 'vuln-004', 'thr-003', 'evt-006', 'Acknowledged', 'usr-003', NOW() - INTERVAL '4 hours'),
('alt-007', 'Layer 7 Volumetric HTTP Flood Contained', 'Edge WAF rate limiting activated against distributed payment endpoint flood.', 'High', 'threat', 'ast-007', 'vuln-006', 'thr-006', NULL, 'Resolved', 'usr-002', NOW() - INTERVAL '1 day'),
('alt-008', 'Perimeter Firewall Management Port Probing', 'External IP sweeping edge firewall management interfaces.', 'Medium', 'security_event', 'ast-005', 'vuln-007', NULL, 'evt-004', 'Acknowledged', 'usr-002', NOW() - INTERVAL '1 hour'),
('alt-009', 'SQL Injection Risk in Payment Reporting Endpoint', 'Vulnerability identified in settlement reconciliation module query builder.', 'High', 'vulnerability', 'ast-007', 'vuln-006', NULL, NULL, 'Open', NULL, NULL),
('alt-010', 'Jenkins Script Security Sandbox Escape Risk', 'CI/CD runner plugin requires urgent security update.', 'High', 'vulnerability', 'ast-011', 'vuln-010', 'thr-008', NULL, 'Open', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. RISK SCORES (20 historical daily snapshots for rich trendline curves)
-- ----------------------------------------------------------------------------
INSERT INTO risk_scores (id, overall_score, risk_level, vuln_severity_score, asset_criticality_score, threat_exposure_score, security_event_score, controls_gap_score, factor_breakdown, recorded_at) VALUES
('rsc-001', 82.40, 'Critical', 88.50, 85.00, 84.00, 78.00, 70.00, '[{"factor":"Vulnerability Severity","weight":0.30,"score":88.5,"contribution":26.55,"explanation":"5 Critical CVEs including active RCE and Auth Bypass vulnerabilities"},{"factor":"Asset Criticality","weight":0.20,"score":85.0,"contribution":17.00,"explanation":"High concentration of Tier-1 public API gateways and primary database instances"},{"factor":"Threat Exposure","weight":0.25,"score":84.0,"contribution":21.00,"explanation":"Active APT reconnaissance and suspicious lateral movement attempts detected"},{"factor":"Security Event Velocity","weight":0.15,"score":78.0,"contribution":11.70,"explanation":"Elevated rate of high-severity authorization failures and port scan events"},{"factor":"Controls Gap","weight":0.10,"score":70.0,"contribution":7.00,"explanation":"Missing automated virtual patching on legacy systems and sandbox policy gaps"}]'::jsonb, NOW()),
('rsc-002', 80.10, 'Critical', 86.00, 85.00, 81.00, 75.00, 70.00, '[]'::jsonb, NOW() - INTERVAL '1 day'),
('rsc-003', 78.50, 'High', 84.00, 85.00, 79.00, 74.00, 68.00, '[]'::jsonb, NOW() - INTERVAL '2 days'),
('rsc-004', 76.20, 'High', 82.00, 83.00, 76.00, 71.00, 68.00, '[]'::jsonb, NOW() - INTERVAL '3 days'),
('rsc-005', 74.80, 'High', 80.00, 83.00, 75.00, 69.00, 65.00, '[]'::jsonb, NOW() - INTERVAL '4 days'),
('rsc-006', 77.30, 'High', 83.00, 83.00, 78.00, 72.00, 66.00, '[]'::jsonb, NOW() - INTERVAL '5 days'),
('rsc-007', 79.90, 'High', 85.00, 83.00, 82.00, 76.00, 67.00, '[]'::jsonb, NOW() - INTERVAL '6 days'),
('rsc-008', 75.40, 'High', 81.00, 80.00, 76.00, 70.00, 65.00, '[]'::jsonb, NOW() - INTERVAL '7 days'),
('rsc-009', 73.10, 'High', 78.00, 80.00, 73.00, 68.00, 64.00, '[]'::jsonb, NOW() - INTERVAL '8 days'),
('rsc-010', 71.60, 'High', 76.00, 80.00, 71.00, 66.00, 62.00, '[]'::jsonb, NOW() - INTERVAL '9 days'),
('rsc-011', 69.50, 'High', 74.00, 78.00, 68.00, 65.00, 62.00, '[]'::jsonb, NOW() - INTERVAL '10 days'),
('rsc-012', 67.20, 'High', 72.00, 78.00, 65.00, 62.00, 60.00, '[]'::jsonb, NOW() - INTERVAL '11 days'),
('rsc-013', 65.80, 'High', 70.00, 78.00, 64.00, 60.00, 59.00, '[]'::jsonb, NOW() - INTERVAL '12 days'),
('rsc-014', 68.40, 'High', 73.00, 78.00, 67.00, 63.00, 60.00, '[]'::jsonb, NOW() - INTERVAL '13 days'),
('rsc-015', 64.10, 'High', 68.00, 75.00, 63.00, 58.00, 57.00, '[]'::jsonb, NOW() - INTERVAL '14 days'),
('rsc-016', 62.30, 'High', 66.00, 75.00, 60.00, 57.00, 56.00, '[]'::jsonb, NOW() - INTERVAL '15 days'),
('rsc-017', 59.80, 'Moderate', 63.00, 75.00, 58.00, 54.00, 55.00, '[]'::jsonb, NOW() - INTERVAL '16 days'),
('rsc-018', 58.20, 'Moderate', 61.00, 72.00, 56.00, 53.00, 54.00, '[]'::jsonb, NOW() - INTERVAL '17 days'),
('rsc-019', 56.90, 'Moderate', 59.00, 72.00, 55.00, 51.00, 53.00, '[]'::jsonb, NOW() - INTERVAL '18 days'),
('rsc-020', 55.10, 'Moderate', 57.00, 72.00, 53.00, 49.00, 52.00, '[]'::jsonb, NOW() - INTERVAL '19 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. AI INSIGHTS
-- ----------------------------------------------------------------------------
INSERT INTO ai_insights (id, title, summary, insight_type, confidence_score, recommended_action, category, is_actionable) VALUES
('ins-001', 'Critical RCE Exposure Correlated with Inbound APT Probe', 'The Risk Detection Agent correlated active internet-facing scanning against DEMO-PROD-API-GW-01 with unpatched CVE-2026-38412. Immediate exposure window is high.', 'Threat Posture', 0.96, 'Deploy emergency WAF virtual patch rule #WAF-941100 to filter malformed hop-by-hop headers before patching.', 'Threat Intelligence', TRUE),
('ins-002', 'Elevated Privilege Escalation Risk in Production Kubernetes Cluster', 'Unrestricted namespace service accounts have demonstrated access attempt to aggregate cluster-admin API. Potential lateral escalation pathway.', 'Risk Trend', 0.93, 'Apply Kyverno PodSecurity restricted enforcement and audit clusterrolebindings.', 'Cloud Security', TRUE),
('ins-003', '30-Day Risk Trajectory Forecast: Potential Reduction from 82.4 to 48.0', 'Executing recommended P0 patching across 5 core Tier-1 assets and isolating legacy SMB file server will reduce overall enterprise risk score by ~34.4 points.', 'Remediation Forecast', 0.89, 'Approve orchestrated remediation playbook batch #PB-2026-08.', 'Risk Management', TRUE),
('ins-004', 'Anomalous Data Outflow Flagged on Legacy Archive Server', 'Anomaly Detection Agent identified 4.8 GB outbound egress to unclassified external IP outside baseline transfer profiles.', 'Anomaly Spike', 0.95, 'Isolate host DEMO-LEGACY-FILE-SERVER-SMB on network firewall and initiate forensic memory capture.', 'Threat Response', TRUE),
('ins-005', 'CIS Benchmark Control Gap: Keycloak IdP Signature Validation', 'Compliance Agent detected non-compliance with CIS Benchmark 5.2 (Enforce Strict XML Signature Validation in SSO).', 'Compliance Gap', 0.91, 'Enable strict assertion signature checks in Keycloak admin console.', 'Compliance & Governance', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. SECURITY SCANS
-- ----------------------------------------------------------------------------
INSERT INTO security_scans (id, scan_type, status, target_asset_id, findings_count, started_at, completed_at, scan_summary) VALUES
('scn-001', 'Vulnerability Scan', 'Completed', 'ast-001', 4, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', '{"critical": 1, "high": 1, "medium": 1, "low": 1}'::jsonb),
('scn-002', 'Cloud Config Audit', 'Completed', 'ast-003', 3, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 50 minutes', '{"critical": 1, "high": 0, "medium": 2, "low": 0}'::jsonb),
('scn-003', 'Perimeter Port Scan', 'Completed', 'ast-005', 2, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', '{"critical": 0, "high": 1, "medium": 1, "low": 0}'::jsonb),
('scn-004', 'IAM Policy Check', 'Completed', 'ast-014', 1, NOW() - INTERVAL '7 hours', NOW() - INTERVAL '6 hours 55 minutes', '{"critical": 0, "high": 0, "medium": 1, "low": 0}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
('aud-001', 'usr-002', 'ACKNOWLEDGE_ALERT', 'alert', 'alt-004', '{"alert_id": "alt-004", "reason": "EDR confirmed process containment"}'::jsonb, '192.168.1.144', NOW() - INTERVAL '2 hours'),
('aud-002', 'usr-003', 'ACKNOWLEDGE_ALERT', 'alert', 'alt-006', '{"alert_id": "alt-006", "reason": "Engaged IAM team for Keycloak patch"}'::jsonb, '192.168.1.150', NOW() - INTERVAL '4 hours'),
('aud-003', 'usr-001', 'CALCULATE_RISK_SCORE', 'risk_score', 'rsc-001', '{"score": 82.4, "band": "Critical"}'::jsonb, '10.100.4.12', NOW() - INTERVAL '1 hour'),
('aud-004', 'usr-002', 'AGENT_TASK_TRIGGERED', 'agent_task', 'tsk-demo-01', '{"agent": "Orchestrator", "mode": "Automated pipeline run"}'::jsonb, '192.168.1.144', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. AGENT TASKS
-- ----------------------------------------------------------------------------
INSERT INTO agent_tasks (id, agent_name, status, input_payload, output_payload, related_entity_type, related_entity_id, requires_approval, created_at, completed_at) VALUES
('tsk-demo-01', 'ThreatResponseAgent', 'pending_approval', '{"threat_id": "thr-004", "asset_id": "ast-018", "action_recommended": "Isolate Asset from Production Subnet"}'::jsonb, '{"recommended_action": "Isolate host DEMO-LEGACY-FILE-SERVER-SMB by updating AWS Security Group to Quarantine-VLAN", "risk_impact": "Prevents potential 4.8GB ongoing data exfiltration", "urgency": "Immediate"}'::jsonb, 'threat', 'thr-004', TRUE, NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '39 minutes'),
('tsk-demo-02', 'VulnerabilityRemediationAgent', 'completed', '{"vulnerability_id": "vuln-001", "asset_id": "ast-001"}'::jsonb, '{"playbook": "PB-RCE-WAF-01", "steps": ["Deploy WAF rule filtering X-Forwarded-Host", "Staging canary test", "Apply upstream patch v4.12.3"]}'::jsonb, 'vulnerability', 'vuln-001', FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes'),
('tsk-demo-03', 'ThreatInvestigationAgent', 'completed', '{"threat_id": "thr-001"}'::jsonb, '{"ioc_correlations": ["198.51.100.244", "AS39824"], "mitre_tactics": ["T1595", "T1190"], "threat_actor_attribution": "Correlated with APT-29 automated probing tools"}'::jsonb, 'threat', 'thr-001', FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 55 minutes'),
('tsk-demo-04', 'RiskDetectionAgent', 'completed', '{"scan_window_hours": 24}'::jsonb, '{"detected_risks_count": 5, "highest_exposure_asset": "ast-001"}'::jsonb, 'overall_posture', 'rsc-001', FALSE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 58 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. AGENT ACTIONS
-- ----------------------------------------------------------------------------
INSERT INTO agent_actions (id, task_id, action_type, description, status, approved_by, approved_at, executed_at, result_summary) VALUES
('act-demo-01', 'tsk-demo-01', 'Isolate Asset', 'Quarantine DEMO-LEGACY-FILE-SERVER-SMB to stop anomalous 4.8GB egress flow', 'pending_approval', NULL, NULL, NULL, 'Awaiting human authorization by SecOps Analyst or CISO'),
('act-demo-02', 'tsk-demo-02', 'Apply Virtual Patch', 'Inject Cloudflare WAF header regex inspection rule for CVE-2026-38412', 'executed', 'usr-002', NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 48 minutes', 'WAF Rule #WAF-941100 activated in block mode across all edge nodes. 14 exploit attempts filtered.')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. SYSTEM SETTINGS
-- ----------------------------------------------------------------------------
INSERT INTO system_settings (id, org_name, contact_email, risk_threshold_critical, risk_threshold_high, risk_threshold_medium, auto_approval_low_risk, enable_threat_intel_stream, enable_realtime_anomalies, enable_scheduled_verification, notification_slack_webhook, notification_email_alerts, demo_mode) VALUES
('default', 'Acme Global Defense Operations', 'security-lead@acme-defense.demo', 80, 60, 30, FALSE, TRUE, TRUE, TRUE, 'https://hooks.slack.com/services/DEMO/SECURITY/ALERTS', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;
