/**
 * Migration runner: add_asset_risk_fields
 * Run with: npx ts-node src/scripts/migrate-asset-risk-fields.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { createPool } from '../config/database';

const MIGRATION_SQL = fs.readFileSync(
  path.resolve(__dirname, '../../../database/migrations/add_asset_risk_fields.sql'),
  'utf8'
);

async function run() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    console.log('[Migration] Running add_asset_risk_fields.sql ...');
    await client.query(MIGRATION_SQL);
    console.log('[Migration] ✓ Migration completed successfully.');

    // Verify columns exist
    const verify = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'assets'
        AND column_name IN (
          'environment','internet_exposed','contains_sensitive_data',
          'business_importance','risk_score','risk_level'
        )
      ORDER BY column_name;
    `);
    console.log('[Migration] ✓ Verified new columns:', verify.rows.map((r: any) => r.column_name).join(', '));
  } catch (err: any) {
    console.error('[Migration] ✗ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
