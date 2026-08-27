import { ReportService, SecurityReport } from '../services/report.service';
import { AgentModel } from '../models/agent.model';

export const SecurityReportAgent = {
  name: 'SecurityReportAgent',

  async run(input: { reportType?: 'executive' | 'vulnerability' | 'threat' | 'compliance' } = {}): Promise<SecurityReport> {
    const report = await ReportService.generateReport(input.reportType || 'executive');

    const task = await AgentModel.createTask({
      agent_name: this.name,
      status: 'completed',
      input_payload: input,
      output_payload: {
        reportId: report.id,
        title: report.title,
        metrics: report.metrics,
      },
      requires_approval: false,
    });

    await AgentModel.logAudit({
      action: 'SECURITY_REPORT_DRAFTED',
      entity_type: 'report',
      entity_id: report.id,
      details: { reportType: report.reportType },
    });

    return report;
  }
};
