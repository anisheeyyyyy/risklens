import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from './env';

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

export const createPool = (): Pool => {
  const poolConfig: PoolConfig = config.db.connectionString
    ? {
        connectionString: config.db.connectionString,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 10000,
        max: 10,
      }
    : {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 10000,
        max: 10,
      };

  return new Pool(poolConfig);
};

export const applySchemaAndSeed = async (clientOrPool: Pool): Promise<void> => {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  // Check if core tables exist
  const checkRes = await clientOrPool.query(`
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'assets', 'vulnerabilities', 'threats', 'alerts', 'risk_scores', 'system_settings');
  `);

  const tablesCount = parseInt(checkRes.rows[0]?.count || '0', 10);
  const tablesExist = tablesCount >= 7;

  if (!tablesExist) {
    console.log('[Supabase DB] Core tables not found. Applying database/schema.sql and database/seed.sql...');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await clientOrPool.query(schemaSql);
      console.log('[Supabase DB] Schema successfully applied.');
    }

    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await clientOrPool.query(seedSql);
      console.log('[Supabase DB] Seed data successfully populated.');
    }
  } else {
    console.log('[Supabase DB] Verified existing tables in Supabase PostgreSQL database.');
  }
};

// Initialize PostgreSQL Connection Pool with retry
export const initDatabase = async (): Promise<void> => {
  if (pool) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Database] Connecting to Supabase PostgreSQL (attempt ${attempt}/${maxRetries})...`);
        const candidatePool = createPool();
        
        // Test connection
        const client = await candidatePool.connect();
        const targetDisplay = config.db.connectionString
          ? config.db.connectionString.replace(/:[^:@]+@/, ':***@')
          : `${config.db.host}:${config.db.port}/${config.db.database}`;
        
        console.log(`[Database] Successfully connected to Supabase PostgreSQL at ${targetDisplay}`);
        client.release();

        pool = candidatePool;

        // Automatically verify and apply schema/seed if empty
        await applySchemaAndSeed(pool);
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Database Warning] Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 2000));
        }
      }
    }

    initPromise = null;
    console.error(`[Database Error] Failed to connect to PostgreSQL / Supabase after ${maxRetries} attempts: ${lastError?.message || 'Connection refused'}`);
    throw new Error(`PostgreSQL / Supabase connection failed: ${lastError?.message || 'Connection refused'}. Please verify your DATABASE_URL or PG* credentials in backend/.env`);
  })();

  return initPromise;
};

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  if (!pool) {
    await initDatabase();
  }

  if (!pool) {
    throw new Error('Database pool not initialized. Check your Supabase database credentials.');
  }

  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log('[SQL]', { text: text.trim().slice(0, 100), duration, rows: res.rowCount });
    }
    return res;
  } catch (error: any) {
    console.error('[SQL Error]', { text: text.trim().slice(0, 100), params, error: error.message });
    throw error;
  }
};

export const getClient = async () => {
  if (!pool) {
    await initDatabase();
  }
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return await pool.connect();
};

export const isInMemory = (): boolean => false;
