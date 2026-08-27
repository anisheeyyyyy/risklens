import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file (try backend/.env and root .env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const isSupabaseHost = (host?: string, uri?: string): boolean => {
  return (
    (host && (host.includes('supabase') || host.includes('pooler.supabase.com'))) ||
    (uri && (uri.includes('supabase') || uri.includes('sslmode=require') || uri.includes('sslmode=prefer') || uri.includes('ssl=true'))) ||
    process.env.PGSSL === 'true' ||
    process.env.NODE_ENV === 'production'
  );
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  db: {
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
    host: process.env.PGHOST || process.env.SUPABASE_DB_HOST || 'localhost',
    port: parseInt(process.env.PGPORT || process.env.SUPABASE_DB_PORT || '5432', 10),
    user: process.env.PGUSER || process.env.SUPABASE_DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.SUPABASE_DB_PASSWORD || '',
    database: process.env.PGDATABASE || process.env.SUPABASE_DB_NAME || 'postgres',
    ssl: isSupabaseHost(
      process.env.PGHOST || process.env.SUPABASE_DB_HOST,
      process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
    ),
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
};
