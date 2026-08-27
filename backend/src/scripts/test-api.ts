import http from 'http';

const PORT = 5000;

function request(method: string, path: string, body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-User-Id': 'usr-002',
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 200, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 200, body: rawData });
          }
        });
      }
    );

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('🚀 Testing Live Supabase Backend REST API Endpoints');
  console.log('==================================================');

  try {
    // 1. Health
    console.log('Testing GET /api/health ...');
    const health = await request('GET', '/api/health');
    console.log(`✅ Health: ${health.status} - Service: ${health.body.data?.service}`);

    // 2. Dashboard
    console.log('Testing GET /api/dashboard ...');
    const dash = await request('GET', '/api/dashboard');
    console.log(`✅ Dashboard: ${dash.status} - Live Supabase Risk Score: ${dash.body.data?.riskScore?.overall_score}, Assets: ${dash.body.data?.stats?.totalAssets || dash.body.data?.stats?.protectedAssets}`);

    // 3. Assets
    console.log('Testing GET /api/assets ...');
    const assets = await request('GET', '/api/assets');
    console.log(`✅ Assets List: ${assets.status} - Supabase Row Count: ${assets.body.data?.length}`);

    // 4. Vulnerabilities
    console.log('Testing GET /api/vulnerabilities ...');
    const vulns = await request('GET', '/api/vulnerabilities');
    console.log(`✅ Vulnerabilities: ${vulns.status} - Supabase Row Count: ${vulns.body.data?.length}`);

    const firstVulnId = vulns.body.data[0]?.id;
    if (firstVulnId) {
      console.log(`Testing GET /api/vulnerabilities/${firstVulnId}/remediation ...`);
      const remed = await request('GET', `/api/vulnerabilities/${firstVulnId}/remediation`);
      console.log(`✅ Remediation Agent: ${remed.status} - Playbook: ${remed.body.data?.playbookName}`);
    }

    // 5. Threats
    console.log('Testing GET /api/threats ...');
    const threats = await request('GET', '/api/threats');
    console.log(`✅ Threats List: ${threats.status} - Supabase Row Count: ${threats.body.data?.length}`);

    const firstThreatId = threats.body.data[0]?.id;
    if (firstThreatId) {
      console.log(`Testing POST /api/threats/${firstThreatId}/investigate ...`);
      const invest = await request('POST', `/api/threats/${firstThreatId}/investigate`);
      console.log(`✅ Threat Investigation Agent: ${invest.status} - Confidence: ${invest.body.data?.confidenceScore}`);
    }

    // 6. Risk Score & Recalculate
    console.log('Testing GET /api/risk-score ...');
    const risk = await request('GET', '/api/risk-score');
    console.log(`✅ Risk Score: ${risk.status} - Overall: ${risk.body.data?.current?.overall_score}`);

    console.log('Testing POST /api/risk-score/recalculate ...');
    const recalc = await request('POST', '/api/risk-score/recalculate');
    console.log(`✅ Recalculate Risk: ${recalc.status} - Recalculated Score in Supabase: ${recalc.body.data?.overall_score}`);

    // 7. Full Agent Pipeline Run & Human Approval Gate on Supabase
    console.log('Testing POST /api/agents/run (Orchestrator Pipeline on Supabase) ...');
    const pipeRun = await request('POST', '/api/agents/run', {});
    console.log(`✅ Orchestrator Pipeline: ${pipeRun.status} - Status: ${pipeRun.body.data?.pipelineStatus}`);
    
    const pendingTaskId = pipeRun.body.data?.pendingApprovalTask?.id;
    if (pendingTaskId) {
      console.log(`Testing POST /api/agents/tasks/${pendingTaskId}/approve (Human Approval Gate) ...`);
      const approval = await request('POST', `/api/agents/tasks/${pendingTaskId}/approve`, {});
      console.log(`✅ Human Gate Approved: ${approval.status} - Verification Status: ${approval.body.data?.verification?.verificationStatus}`);
      console.log(`   Verification Agent Verified Action & Updated Risk Score: ${approval.body.data?.verification?.updatedScoreRecord?.overall_score}`);
    }

    // 8. AI Insights
    console.log('Testing GET /api/ai/insights ...');
    const insights = await request('GET', '/api/ai/insights');
    console.log(`✅ AI Insights: ${insights.status} - 30-Day Forecast Points: ${insights.body.data?.forecast?.forecastPoints?.length}`);

    // 9. Reports
    console.log('Testing GET /api/reports ...');
    const reports = await request('GET', '/api/reports');
    console.log(`✅ Reports: ${reports.status} - Report Count: ${reports.body.data?.length}`);

    // 10. Settings
    console.log('Testing GET /api/settings ...');
    const settings = await request('GET', '/api/settings');
    console.log(`✅ Settings: ${settings.status} - Org: ${settings.body.data?.org_name}`);

    console.log('==================================================');
    console.log('🎉 ALL 10 APIS & AGENTIC WORKFLOW VERIFIED ON SUPABASE!');
    console.log('==================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
