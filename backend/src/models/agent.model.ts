import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface AgentTask {
  id: string;
  agent_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'pending_approval' | 'rejected' | 'failed';
  input_payload: any;
  output_payload: any;
  related_entity_type?: string;
  related_entity_id?: string;
  requires_approval: boolean;
  created_at: string;
  completed_at?: string;
  actions?: AgentAction[];
}

export interface AgentAction {
  id: string;
  task_id: string;
  action_type: string;
  description: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'verified';
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  executed_at?: string;
  result_summary?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: any;
  ip_address?: string;
  created_at: string;
}

export const AgentModel = {
  async findTasks(filters: { status?: string; agent_name?: string; limit?: number } = {}): Promise<AgentTask[]> {
    let sql = `SELECT * FROM agent_tasks WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.agent_name) {
      sql += ` AND agent_name = $${paramIndex++}`;
      params.push(filters.agent_name);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const res = await query<AgentTask>(sql, params);
    const tasks = res.rows.map(row => ({
      ...row,
      input_payload: typeof row.input_payload === 'string' ? JSON.parse(row.input_payload) : row.input_payload,
      output_payload: typeof row.output_payload === 'string' ? JSON.parse(row.output_payload) : row.output_payload,
      actions: [] as AgentAction[],
    }));

    if (tasks.length > 0) {
      const actionsRes = await query<AgentAction>('SELECT * FROM agent_actions ORDER BY created_at DESC');
      const actionMap = new Map<string, AgentAction[]>();
      for (const act of actionsRes.rows) {
        if (!actionMap.has(act.task_id)) {
          actionMap.set(act.task_id, []);
        }
        actionMap.get(act.task_id)!.push(act);
      }
      for (const t of tasks) {
        t.actions = actionMap.get(t.id) || [];
      }
    }

    return tasks;
  },

  async findTaskById(id: string): Promise<AgentTask | null> {
    const tasks = await this.findTasks();
    return tasks.find(t => t.id === id) || null;
  },

  async createTask(data: {
    agent_name: string;
    status?: string;
    input_payload: any;
    output_payload?: any;
    related_entity_type?: string;
    related_entity_id?: string;
    requires_approval?: boolean;
  }): Promise<AgentTask> {
    const id = `tsk-${uuidv4().substring(0, 8)}`;
    const sql = `
      INSERT INTO agent_tasks (
        id, agent_name, status, input_payload, output_payload,
        related_entity_type, related_entity_id, requires_approval, created_at,
        completed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
      RETURNING *
    `;
    const res = await query<AgentTask>(sql, [
      id,
      data.agent_name,
      data.status || 'pending',
      JSON.stringify(data.input_payload),
      JSON.stringify(data.output_payload || {}),
      data.related_entity_type || null,
      data.related_entity_id || null,
      data.requires_approval || false,
      data.status === 'completed' ? new Date().toISOString() : null,
    ]);
    return res.rows[0];
  },

  async updateTaskStatus(id: string, status: string, output_payload?: any): Promise<AgentTask | null> {
    const sql = `
      UPDATE agent_tasks
      SET status = $1::varchar,
          output_payload = CASE WHEN $2::jsonb IS NOT NULL THEN $2::jsonb ELSE output_payload END,
          completed_at = CASE WHEN $1::varchar IN ('completed', 'rejected', 'failed') THEN NOW() ELSE completed_at END
      WHERE id = $3::varchar
      RETURNING *
    `;
    const res = await query<AgentTask>(sql, [
      status,
      output_payload ? JSON.stringify(output_payload) : null,
      id,
    ]);
    return res.rows[0] || null;
  },

  async createAction(data: {
    task_id: string;
    action_type: string;
    description: string;
    status?: string;
    result_summary?: string;
  }): Promise<AgentAction> {
    const id = `act-${uuidv4().substring(0, 8)}`;
    const sql = `
      INSERT INTO agent_actions (
        id, task_id, action_type, description, status, result_summary, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const res = await query<AgentAction>(sql, [
      id,
      data.task_id,
      data.action_type,
      data.description,
      data.status || 'pending_approval',
      data.result_summary || null,
    ]);
    return res.rows[0];
  },

  async updateActionStatus(
    id: string,
    status: 'approved' | 'rejected' | 'executed' | 'verified',
    userId?: string,
    resultSummary?: string
  ): Promise<AgentAction | null> {
    const sql = `
      UPDATE agent_actions
      SET status = $1::varchar,
          approved_by = CASE WHEN $1::varchar = 'approved' THEN COALESCE($2::varchar, approved_by) ELSE approved_by END,
          approved_at = CASE WHEN $1::varchar = 'approved' THEN NOW() ELSE approved_at END,
          executed_at = CASE WHEN $1::varchar = 'executed' THEN NOW() ELSE executed_at END,
          result_summary = COALESCE($3::text, result_summary)
      WHERE id = $4::varchar
      RETURNING *
    `;
    const res = await query<AgentAction>(sql, [status, userId || null, resultSummary || null, id]);
    return res.rows[0] || null;
  },

  async logAudit(data: {
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
    ip_address?: string;
  }): Promise<void> {
    const id = `aud-${uuidv4().substring(0, 8)}`;
    const sql = `
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;
    await query(sql, [
      id,
      data.user_id || 'usr-002',
      data.action,
      data.entity_type,
      data.entity_id || null,
      JSON.stringify(data.details || {}),
      data.ip_address || '127.0.0.1',
    ]);
  },

  async getAuditLogs(limit: number = 20): Promise<AuditLog[]> {
    const sql = `
      SELECT a.*, u.full_name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;
    const res = await query<AuditLog>(sql, [limit]);
    return res.rows.map(row => ({
      ...row,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
    }));
  }
};
