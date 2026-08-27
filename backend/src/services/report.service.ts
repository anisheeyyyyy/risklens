import { RiskService } from './risk.service';
import { AssetModel } from '../models/asset.model';
import { VulnerabilityModel } from '../models/vulnerability.model';
import { ThreatModel } from '../models/threat.model';
import { AlertModel } from '../models/alert.model';
import { SettingsModel } from '../models/settings.model';
import { v4 as uuidv4 } from 'uuid';

export interface SecurityReport {
  id: string;
  reportType: 'executive' | 'vulnerability' | 'threat' | 'compliance';
  title: string;
  generatedAt: string;
  generatedBy: string;
  organization: string;
  executiveSummary: string;
  riskScore: any;
  metrics: {
    totalAssets: number;
    criticalAssets: number;
    openVulnerabilities: number;
    criticalVulnerabilities: number;
    activeThreats: number;
    openAlerts: number;
  };
  keyFindings: string[];
  remediationRoadmap: Array<{
    priority: string;
    action: string;
    targetAsset: string;
    estimatedRiskImpact: string;
  }>;
  compliancePosture: {
    framework: string;
    scorePercent: number;
    passedControls: number;
    totalControls: number;
    status: 'Compliant' | 'Needs Review' | 'Non-Compliant';
  }[];
}

export const ReportService = {
  async generateReport(type: 'executive' | 'vulnerability' | 'threat' | 'compliance' = 'executive'): Promise<SecurityReport> {
    const [risk, assetsCount, vulnCount, threatCount, alertCount, settings] = await Promise.all([
      RiskService.getLatestOrCompute(),
      AssetModel.count(),
      VulnerabilityModel.countBySeverity(),
      ThreatModel.count(),
      AlertModel.count(),
      SettingsModel.get(),
    ]);

    const reportId = `rep-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    let title = 'Enterprise Cyber Risk & Defensive Posture Briefing';
    let execSummary = `As of ${new Date().toLocaleDateString()}, ${settings.org_name} exhibits an Enterprise Risk Score of ${risk.overall_score}/100 (${risk.risk_level} Risk Tier). Automated defense agents have prioritized ${vulnCount.critical} critical CVE vulnerabilities and ${threatCount.critical} zero-day/reconnaissance threat vectors requiring immediate remediation.`;

    if (type === 'vulnerability') {
      title = 'Comprehensive Vulnerability Exposure & Patch Prioritization Report';
      execSummary = `Technical vulnerability audit covering ${assetsCount.total} managed inventory assets. Identified ${vulnCount.total} total vulnerability records (${vulnCount.critical} Critical, ${vulnCount.high} High, ${vulnCount.resolved} Resolved). Primary focus remains on perimeter ingress API Gateways and core database clusters.`;
    } else if (type === 'threat') {
      title = 'Threat Intelligence & Incident Kill-Chain Briefing';
      execSummary = `Analysis of ${threatCount.total} threat intelligence telemetry streams and adversary indicators. ${threatCount.active} threat campaigns are presently under active investigation or containment, dominated by APT probing and abnormal egress from legacy storage boundaries.`;
    } else if (type === 'compliance') {
      title = 'Regulatory Compliance & Cyber Defense Benchmark Audit';
      execSummary = `Compliance readiness evaluation against NIST CSF 2.0, CIS Controls v8, and PCI-DSS 4.0. Aggregate compliance posture is measured at 84.6%, with specific gaps identified in legacy protocol de-provisioning and strict SAML signature verification.`;
    }

    return {
      id: reportId,
      reportType: type,
      title,
      generatedAt: now,
      generatedBy: 'SecurityReportAgent (Autonomous SecOps Pipeline)',
      organization: settings.org_name,
      executiveSummary: execSummary,
      riskScore: risk,
      metrics: {
        totalAssets: assetsCount.total,
        criticalAssets: assetsCount.critical,
        openVulnerabilities: vulnCount.total - vulnCount.resolved,
        criticalVulnerabilities: vulnCount.critical,
        activeThreats: threatCount.active,
        openAlerts: alertCount.open,
      },
      keyFindings: [
        'Edge API Gateway (DEMO-PROD-API-GW-01) exposed to unauthenticated RCE CVE-2026-38412 under active reconnaissance.',
        'Legacy SMB Archive Server (DEMO-LEGACY-FILE-SERVER-SMB) flagged for 4.8GB anomalous egress; requires immediate quarantine.',
        'PostgreSQL Core Database (DEMO-PROD-CORE-DB-PRIMARY) TLS renegotiation bypass risk requires TLSv1.3 enforcement.',
        'Production Kubernetes cluster service accounts require Kyverno restricted pod security baseline enforcement.'
      ],
      remediationRoadmap: [
        {
          priority: 'P0 - Immediate',
          action: 'Deploy Cloudflare WAF Header Regex filter and isolate legacy SMB file server',
          targetAsset: 'DEMO-PROD-API-GW-01 / DEMO-LEGACY-FILE-SERVER-SMB',
          estimatedRiskImpact: '-18.5 Risk Points',
        },
        {
          priority: 'P1 - High',
          action: 'Upgrade Keycloak IdP to v24.8.1 with strict XML signature verification',
          targetAsset: 'DEMO-AUTH-KEYCLOAK-01',
          estimatedRiskImpact: '-7.2 Risk Points',
        },
        {
          priority: 'P1 - High',
          action: 'Refactor SQL settlement queries to use parameterized prepared statements',
          targetAsset: 'DEMO-PAYMENT-INGEST-SVC',
          estimatedRiskImpact: '-5.4 Risk Points',
        },
        {
          priority: 'P2 - Moderate',
          action: 'Upgrade Jenkins Script Security Plugin and enforce ephemeral build agents',
          targetAsset: 'DEMO-CI-CD-JENKINS-RUNNER',
          estimatedRiskImpact: '-3.3 Risk Points',
        },
      ],
      compliancePosture: [
        {
          framework: 'NIST CSF 2.0 (Protect & Detect)',
          scorePercent: 88,
          passedControls: 94,
          totalControls: 108,
          status: 'Compliant',
        },
        {
          framework: 'CIS Controls v8 (IG2)',
          scorePercent: 82,
          passedControls: 125,
          totalControls: 153,
          status: 'Needs Review',
        },
        {
          framework: 'PCI-DSS v4.0 (Cardholder Data)',
          scorePercent: 84,
          passedControls: 180,
          totalControls: 215,
          status: 'Needs Review',
        },
        {
          framework: 'ISO/IEC 27001:2022',
          scorePercent: 91,
          passedControls: 85,
          totalControls: 93,
          status: 'Compliant',
        },
      ],
    };
  }
};
