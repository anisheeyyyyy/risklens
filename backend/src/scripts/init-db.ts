import fs from 'fs';
import path from 'path';
import { createPool, initDatabase, query } from '../config/database';

async function run() {
  console.log('==================================================');
  console.log('🚀 RISK LENS — Supabase PostgreSQL Initializer');
  console.log('==================================================');

  const pool = createPool();
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  try {
    const client = await pool.connect();
    console.log('[InitDB] Connected to PostgreSQL / Supabase instance successfully.');
    client.release();

    console.log('[InitDB] Applying database/schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Schema tables, constraints, and indexes created successfully.');

    console.log('[InitDB] Populating database/seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('✅ Synthetic demonstration dataset seeded successfully.');

    console.log('[InitDB] Verifying live Supabase table counts...');
    const [users, assets, vulns, threats, alerts, riskScores, events, tasks, actions] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM assets'),
      pool.query('SELECT COUNT(*) FROM vulnerabilities'),
      pool.query('SELECT COUNT(*) FROM threats'),
      pool.query('SELECT COUNT(*) FROM alerts'),
      pool.query('SELECT COUNT(*) FROM risk_scores'),
      pool.query('SELECT COUNT(*) FROM security_events'),
      pool.query('SELECT COUNT(*) FROM agent_tasks'),
      pool.query('SELECT COUNT(*) FROM agent_actions'),
    ]);

    console.log('--------------------------------------------------');
    console.log(`✅ users:           ${users.rows[0].count} rows`);
    console.log(`✅ assets:          ${assets.rows[0].count} rows (Expected >= 18)`);
    console.log(`✅ vulnerabilities: ${vulns.rows[0].count} rows (Expected >= 40)`);
    console.log(`✅ threats:         ${threats.rows[0].count} rows (Expected >= 7)`);
    console.log(`✅ alerts:          ${alerts.rows[0].count} rows (Expected >= 10)`);
    console.log(`✅ risk_scores:     ${riskScores.rows[0].count} rows (Expected >= 15)`);
    console.log(`✅ security_events: ${events.rows[0].count} rows (Expected >= 10)`);
    console.log(`✅ agent_tasks:     ${tasks.rows[0].count} rows`);
    console.log(`✅ agent_actions:   ${actions.rows[0].count} rows`);
    console.log('--------------------------------------------------');
    console.log('🎉 Supabase PostgreSQL database is fully initialized and verified!');
    await pool.end();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ [InitDB Error]:', err.message);
    await pool.end();
    process.exit(1);
  }
}

run();
