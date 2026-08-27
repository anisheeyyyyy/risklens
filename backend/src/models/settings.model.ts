import { query } from '../config/database';

export interface SystemSettings {
  id: string;
  org_name: string;
  contact_email: string;
  risk_threshold_critical: number;
  risk_threshold_high: number;
  risk_threshold_medium: number;
  auto_approval_low_risk: boolean;
  enable_threat_intel_stream: boolean;
  enable_realtime_anomalies: boolean;
  enable_scheduled_verification: boolean;
  notification_slack_webhook?: string;
  notification_email_alerts: boolean;
  demo_mode: boolean;
  updated_at: string;
}

export const SettingsModel = {
  async get(): Promise<SystemSettings> {
    const res = await query<SystemSettings>('SELECT * FROM system_settings WHERE id = $1', ['default']);
    if (res.rows[0]) return res.rows[0];

    // Default fallback
    return {
      id: 'default',
      org_name: 'Acme Global Defense Operations',
      contact_email: 'security-lead@acme-defense.demo',
      risk_threshold_critical: 80,
      risk_threshold_high: 60,
      risk_threshold_medium: 30,
      auto_approval_low_risk: false,
      enable_threat_intel_stream: true,
      enable_realtime_anomalies: true,
      enable_scheduled_verification: true,
      notification_slack_webhook: 'https://hooks.slack.com/services/DEMO/SECURITY/ALERTS',
      notification_email_alerts: true,
      demo_mode: true,
      updated_at: new Date().toISOString(),
    };
  },

  async update(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.get();
    const sql = `
      INSERT INTO system_settings (
        id, org_name, contact_email, risk_threshold_critical, risk_threshold_high,
        risk_threshold_medium, auto_approval_low_risk, enable_threat_intel_stream,
        enable_realtime_anomalies, enable_scheduled_verification,
        notification_slack_webhook, notification_email_alerts, demo_mode, updated_at
      ) VALUES (
        'default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        org_name = EXCLUDED.org_name,
        contact_email = EXCLUDED.contact_email,
        risk_threshold_critical = EXCLUDED.risk_threshold_critical,
        risk_threshold_high = EXCLUDED.risk_threshold_high,
        risk_threshold_medium = EXCLUDED.risk_threshold_medium,
        auto_approval_low_risk = EXCLUDED.auto_approval_low_risk,
        enable_threat_intel_stream = EXCLUDED.enable_threat_intel_stream,
        enable_realtime_anomalies = EXCLUDED.enable_realtime_anomalies,
        enable_scheduled_verification = EXCLUDED.enable_scheduled_verification,
        notification_slack_webhook = EXCLUDED.notification_slack_webhook,
        notification_email_alerts = EXCLUDED.notification_email_alerts,
        demo_mode = EXCLUDED.demo_mode,
        updated_at = NOW()
      RETURNING *
    `;
    const res = await query<SystemSettings>(sql, [
      data.org_name || current.org_name,
      data.contact_email || current.contact_email,
      data.risk_threshold_critical ?? current.risk_threshold_critical,
      data.risk_threshold_high ?? current.risk_threshold_high,
      data.risk_threshold_medium ?? current.risk_threshold_medium,
      data.auto_approval_low_risk ?? current.auto_approval_low_risk,
      data.enable_threat_intel_stream ?? current.enable_threat_intel_stream,
      data.enable_realtime_anomalies ?? current.enable_realtime_anomalies,
      data.enable_scheduled_verification ?? current.enable_scheduled_verification,
      data.notification_slack_webhook !== undefined ? data.notification_slack_webhook : current.notification_slack_webhook,
      data.notification_email_alerts ?? current.notification_email_alerts,
      data.demo_mode ?? current.demo_mode,
    ]);
    return res.rows[0];
  }
};
