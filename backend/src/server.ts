import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initDatabase, query } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import Route Handlers
import dashboardRoutes from './routes/dashboard.routes';
import assetsRoutes from './routes/assets.routes';
import vulnerabilitiesRoutes from './routes/vulnerabilities.routes';
import threatsRoutes from './routes/threats.routes';
import alertsRoutes from './routes/alerts.routes';
import aiRoutes from './routes/ai.routes';
import reportsRoutes from './routes/reports.routes';
import settingsRoutes from './routes/settings.routes';
import authRoutes from './routes/auth.routes';
import { getRiskScore, recalculateRiskScore } from './controllers/risk.controller';
import { optionalAuth, requireAuth, requireRole } from './middleware/auth.middleware';

const app = express();

// CORS Configuration - Supports frontend origin and local network access
app.use(
  cors({
    origin: true, // Reflect request origin to allow localhost, 127.0.0.1, and LAN IP addresses
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Auth Context Middleware
app.use(optionalAuth);

// Root and API Index Endpoints
const apiIndexHandler = (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    data: {
      name: 'RISK LENS — Enterprise Cybersecurity Risk Management Platform API',
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      frontendUrl: config.frontendUrl,
      endpoints: {
        health: '/api/health',
        dashboard: '/api/dashboard',
        assets: '/api/assets',
        vulnerabilities: '/api/vulnerabilities',
        threats: '/api/threats',
        alerts: '/api/alerts',
        riskScore: '/api/risk-score',
        riskRecalculate: 'POST /api/risk-score/recalculate',
        aiInsights: '/api/ai/insights',
        agentRun: 'POST /api/agents/run',
        agentTasks: '/api/agents/tasks',
        agentApprove: 'POST /api/agents/tasks/:id/approve',
        agentReject: 'POST /api/agents/tasks/:id/reject',
        reports: '/api/reports',
        reportGenerate: 'POST /api/reports/generate',
        settings: '/api/settings',
      },
    },
  });
};

app.get('/', apiIndexHandler);
app.get('/api', apiIndexHandler);

// Health check endpoint with live Supabase database connectivity test
app.get('/api/health', async (req: express.Request, res: express.Response) => {
  const start = Date.now();
  let dbStatus: any = {
    connected: false,
    provider: 'Supabase PostgreSQL',
    host: config.db.host,
    database: config.db.database,
  };

  try {
    const dbTest = await query(`
      SELECT 
        1 as ok, 
        current_database() as db_name,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
    `);
    const latency = Date.now() - start;
    dbStatus = {
      connected: true,
      provider: 'Supabase PostgreSQL',
      host: config.db.host,
      database: dbTest.rows[0]?.db_name || config.db.database,
      latencyMs: latency,
      publicTablesCount: parseInt(dbTest.rows[0]?.table_count || '0', 10),
      ssl: config.db.ssl,
      status: 'CONNECTED_AND_AUTHENTICATED',
    };

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'RiskLens Defense API',
        version: '1.0.0',
        database: dbStatus,
      },
    });
  } catch (err: any) {
    res.status(503).json({
      success: false,
      data: {
        status: 'database_unavailable',
        timestamp: new Date().toISOString(),
        service: 'RiskLens Defense API',
        version: '1.0.0',
        database: {
          ...dbStatus,
          connected: false,
          error: err.message,
        },
      },
    });
  }
});

// API Routes (Protected)
app.use('/api/auth', authRoutes); // auth routes handle their own protection
app.use('/api/users', requireAuth, authRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/assets', requireAuth, assetsRoutes);
app.use('/api/vulnerabilities', requireAuth, vulnerabilitiesRoutes);
app.use('/api/threats', requireAuth, threatsRoutes);
app.use('/api/alerts', requireAuth, alertsRoutes);
app.use('/api/ai', requireAuth, aiRoutes);
app.use('/api/agents', requireAuth, aiRoutes); // Alias for agent tasks & run
app.use('/api/reports', requireAuth, reportsRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);

// Risk Score Routes (Protected)
app.get('/api/risk-score', requireAuth, getRiskScore);
app.post('/api/risk-score/recalculate', requireAuth, recalculateRiskScore);

// 404 and Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log('[RiskLens API] Initializing database layer...');
    try {
      await initDatabase();
    } catch (dbErr: any) {
      console.warn(`[RiskLens API] Database not connected yet: ${dbErr.message}`);
      console.warn('[RiskLens API] Server started. Database connection will retry on request.');
    }

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`  🛡️  RISK LENS Defense API is running on port ${config.port}`);
      console.log(`  🔗  Base URL: http://localhost:${config.port}/api`);
      console.log(`  🌐  Allowed Frontend: ${config.frontendUrl}`);
      console.log(`=======================================================`);
    });
  } catch (err: any) {
    console.error('[RiskLens API] Failed to start server:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
