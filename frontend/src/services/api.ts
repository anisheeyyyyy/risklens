const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
};

export type DashboardData = {
  cyberRiskScore: number;
  riskLevel: string;
  protectedAssets: number;
  vulnerabilities: number;
  activeThreats: number;
  securityHealth: number;

  riskFactors?: {
    criticalVulnerabilities?: number;
    highRiskAssets?: number;
    activeThreats?: number;
  };

  trend?: {
    change?: number;
    period?: string;
  };

  riskHistory?: {
    date?: string;
    recordedAt?: string;
    score?: number;
  }[];

  recentActivity?: {
    title: string;
    source?: string;
    time?: string;
    severity?: string;
  }[];

  aiInsights?: {
    score?: number;
    recommendation?: string;
  };
};

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ============================================================
   GENERIC REQUEST
   ============================================================ */

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const storedUser =
    localStorage.getItem("risklens_user");

  const storedToken =
    localStorage.getItem("risklens_token");

  let userId = "";

  if (storedUser) {
    try {
      userId =
        JSON.parse(storedUser).id || "";
    } catch {
      userId = "";
    }
  }

  const customHeaders: Record<
    string,
    string
  > = {
    "Content-Type": "application/json",
  };

  if (userId) {
    customHeaders["X-User-Id"] = userId;
  }

  if (storedToken) {
    customHeaders[
      "Authorization"
    ] = `Bearer ${storedToken}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...customHeaders,
        ...(options.headers || {}),
      },
    }
  );

  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Invalid server response (${response.status})`
    );
  }

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.error?.message ||
        `Request failed (${response.status})`
    );
  }

  return result.data;
}

/* ============================================================
   DASHBOARD
   ============================================================ */

export async function getDashboard(): Promise<unknown> {
  return request<unknown>(
    "/dashboard"
  );
}

export async function recalculateRiskScore() {
  return request(
    "/risk-score/recalculate",
    {
      method: "POST",
    }
  );
}

/* ============================================================
   ASSETS
   ============================================================ */

export type Asset = {
  id: string;
  name: string;

  type?: string;

  asset_type?: string;

  status?: string;

  criticality?: string;

  riskLevel?: string;

  risk_level?: string;

  risk_score?: number;

  lastScan?: string;

  last_scanned_at?: string;

  createdAt?: string;

  created_at?: string;

  updatedAt?: string;

  updated_at?: string;

  /* General technical details */
  hostname?: string;

  ip_address?: string;

  /* Factual risk attributes */
  environment?: string;

  internet_exposed?: boolean;

  contains_sensitive_data?: boolean;

  business_importance?: string;

  /* Type-specific fields */
  cloud_provider?: string;

  region?: string;

  resource_id?: string;

  database_type?: string;

  port?: number;

  operating_system?: string;

  management_ip_address?: string;

  network_zone?: string;

  application_url?: string;

  /* Metadata */
  owner?: string;

  location?: string;

  tags?: string[];

  /* Related objects */
  vulnerability_count?: number;

  threat_count?: number;
};

export type AssetCreateInput = {
  name: string;

  asset_type: string;

  status?: string;

  environment?: string;

  internet_exposed?: boolean;

  contains_sensitive_data?: boolean;

  business_importance?: string;

  hostname?: string;

  ip_address?: string;

  cloud_provider?: string;

  region?: string;

  resource_id?: string;

  database_type?: string;

  port?: number;

  operating_system?: string;

  management_ip_address?: string;

  network_zone?: string;

  application_url?: string;

  owner?: string;

  location?: string;

  tags?: string[];
};

export type AssetUpdateInput =
  Partial<AssetCreateInput>;

export type AssetScoreBreakdown = {
  business_importance_pts: number;

  environment_pts: number;

  internet_exposed_pts: number;

  sensitive_data_pts: number;

  asset_type_pts?: number;

  total: number;
};

export type AssetCreateResult = {
  asset: Asset;

  calculatedCriticality: string;

  calculatedRiskLevel: string;

  riskScore: number;

  scoreBreakdown?: AssetScoreBreakdown;
};

/* ------------------------------------------------------------
   GET ASSETS
   ------------------------------------------------------------ */

export async function getAssets(): Promise<
  Asset[]
> {
  const result =
    await request<unknown>("/assets");

  if (Array.isArray(result)) {
    return result as Asset[];
  }

  if (
    result &&
    typeof result === "object" &&
    "items" in result &&
    Array.isArray(
      (
        result as {
          items: unknown;
        }
      ).items
    )
  ) {
    return (
      result as {
        items: Asset[];
      }
    ).items;
  }

  if (
    result &&
    typeof result === "object" &&
    "assets" in result &&
    Array.isArray(
      (
        result as {
          assets: unknown;
        }
      ).assets
    )
  ) {
    return (
      result as {
        assets: Asset[];
      }
    ).assets;
  }

  return [];
}

/* ------------------------------------------------------------
   CREATE ASSET
   ------------------------------------------------------------ */

export async function createAsset(
  data: AssetCreateInput
): Promise<AssetCreateResult> {
  return request<AssetCreateResult>(
    "/assets",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/* ------------------------------------------------------------
   UPDATE ASSET
   ------------------------------------------------------------ */

export async function updateAsset(
  id: string,
  data: AssetUpdateInput
): Promise<Asset> {
  return request<Asset>(
    `/assets/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

/* ------------------------------------------------------------
   DELETE ASSET
   ------------------------------------------------------------ */

export async function deleteAsset(
  id: string
) {
  return request(
    `/assets/${id}`,
    {
      method: "DELETE",
    }
  );
}

/* ============================================================
   VULNERABILITIES
   ============================================================ */

export type Vulnerability = {
  id: string;

  cveId?: string;

  cve_id?: string;

  title?: string;

  description?: string;

  severity?: string;

  cvss?: number;

  cvssScore?: number;

  assetId?: string;

  asset_id?: string;

  assetName?: string;

  status?: string;

  detectedAt?: string;

  detected_at?: string;

  createdAt?: string;
};

export async function getVulnerabilities(
  _params?: Record<
    string,
    string
  >
): Promise<Vulnerability[]> {
  const result =
    await request<unknown>(
      "/vulnerabilities"
    );

  if (Array.isArray(result)) {
    return result as Vulnerability[];
  }

  if (
    result &&
    typeof result === "object" &&
    "items" in result &&
    Array.isArray(
      (
        result as {
          items: unknown;
        }
      ).items
    )
  ) {
    return (
      result as {
        items: Vulnerability[];
      }
    ).items;
  }

  if (
    result &&
    typeof result === "object" &&
    "vulnerabilities" in result &&
    Array.isArray(
      (
        result as {
          vulnerabilities: unknown;
        }
      ).vulnerabilities
    )
  ) {
    return (
      result as {
        vulnerabilities: Vulnerability[];
      }
    ).vulnerabilities;
  }

  return [];
}

export async function createVulnerability(
  data: unknown
) {
  return request(
    "/vulnerabilities",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateVulnerability(
  id: string,
  data: unknown
) {
  return request(
    `/vulnerabilities/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function getVulnerabilityRemediation(
  id: string
) {
  return request(
    `/vulnerabilities/${id}/remediation`
  );
}

/* ============================================================
   THREATS
   ============================================================ */

export type Threat = {
  id: string;

  title?: string;

  name?: string;

  type?: string;

  threatType?: string;

  severity?: string;

  source?: string;

  assetId?: string;

  asset_id?: string;

  assetName?: string;

  status?: string;

  investigationStatus?: string;

  investigation_status?: string;

  detectedAt?: string;

  detected_at?: string;

  mitreTechnique?: string;

  mitre_tactic?: string;

  iocs?: string[];

  createdAt?: string;
};

export async function getThreats(
  _params?: Record<
    string,
    string
  >
): Promise<Threat[]> {
  const result =
    await request<unknown>(
      "/threats"
    );

  if (Array.isArray(result)) {
    return result as Threat[];
  }

  if (
    result &&
    typeof result === "object" &&
    "items" in result &&
    Array.isArray(
      (
        result as {
          items: unknown;
        }
      ).items
    )
  ) {
    return (
      result as {
        items: Threat[];
      }
    ).items;
  }

  if (
    result &&
    typeof result === "object" &&
    "threats" in result &&
    Array.isArray(
      (
        result as {
          threats: unknown;
        }
      ).threats
    )
  ) {
    return (
      result as {
        threats: Threat[];
      }
    ).threats;
  }

  return [];
}

export async function createThreat(
  data: unknown
) {
  return request(
    "/threats",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateThreat(
  id: string,
  data: unknown
) {
  return request(
    `/threats/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function investigateThreat(
  id: string
) {
  return request(
    `/threats/${id}/investigate`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   ALERTS
   ============================================================ */

export async function getAlerts(
  params?: {
    status?: string;
    severity?: string;
  }
) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).filter(
          ([, value]) =>
            value != null
        ) as [
          string,
          string
        ][]
      ).toString()
    : "";

  const result =
    await request<unknown>(
      `/alerts${qs}`
    );

  if (Array.isArray(result)) {
    return result;
  }

  if (
    result &&
    typeof result === "object" &&
    "alerts" in result &&
    Array.isArray(
      (result as any).alerts
    )
  ) {
    return (result as any).alerts;
  }

  if (
    result &&
    typeof result === "object" &&
    "items" in result &&
    Array.isArray(
      (result as any).items
    )
  ) {
    return (result as any).items;
  }

  return [];
}

export async function updateAlert(
  id: string,
  data: unknown
) {
  return request(
    `/alerts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

/* ============================================================
   RISK
   ============================================================ */

export async function getRiskScore() {
  return request(
    "/risk-score"
  );
}

/* ============================================================
   AI
   ============================================================ */

export async function getAIInsights() {
  return request(
    "/ai/insights"
  );
}

export async function analyzeAI(
  data: unknown = {}
) {
  return request(
    "/ai/analyze",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function runAIPipeline(
  data: unknown = {}
): Promise<any> {
  return request(
    "/agents/run",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/* ============================================================
   AGENTS
   ============================================================ */

export async function getAgentTasks() {
  return request(
    "/agents/tasks"
  );
}

export async function runAgents(
  data: unknown = {}
) {
  return request(
    "/agents/run",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function approveAgentTask(
  id: string
) {
  return request(
    `/agents/tasks/${id}/approve`,
    {
      method: "POST",
    }
  );
}

export async function rejectAgentTask(
  id: string
) {
  return request(
    `/agents/tasks/${id}/reject`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   REPORTS
   ============================================================ */

export async function getReports() {
  return request(
    "/reports"
  );
}

export async function generateReport(
  data:
    | string
    | {
        reportType?: string;
        [key: string]: any;
      } = "executive"
) {
  const payload =
    typeof data === "string"
      ? { reportType: data }
      : data;

  return request(
    "/reports/generate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */

export async function getSettings() {
  return request(
    "/settings"
  );
}

export async function updateSettings(
  data: unknown
) {
  return request(
    "/settings",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function reseedDatabase(): Promise<unknown> {
  return request(
    "/settings/reseed",
    {
      method: "POST",
    }
  );
}

/* ============================================================
   COMPATIBILITY API OBJECT
   ============================================================ */

export const api = {
  getDashboard,
  recalculateRiskScore,

  assets: {
    getAll: getAssets,
    list: getAssets,
    create: createAsset,
    update: updateAsset,
    delete: deleteAsset,
  },

  vulnerabilities: {
    getAll: getVulnerabilities,
    list: getVulnerabilities,
    create: createVulnerability,
    update: updateVulnerability,
    getRemediation:
      getVulnerabilityRemediation,
    remediation:
      getVulnerabilityRemediation,
  },

  threats: {
    getAll: getThreats,
    list: getThreats,
    create: createThreat,
    update: updateThreat,
    investigate: investigateThreat,
  },

  alerts: {
    getAll: getAlerts,
    list: getAlerts,
    update: updateAlert,
  },

  risk: {
    get: getRiskScore,
    recalculate:
      recalculateRiskScore,
  },

  ai: {
    insights: getAIInsights,
    getInsights: getAIInsights,
    analyze: analyzeAI,
    runPipeline: runAIPipeline,
    getTasks: getAgentTasks,
    approveTask:
      approveAgentTask,
    rejectTask: (
      id: string,
      _reason?: string
    ) => rejectAgentTask(id),
  },

  agents: {
    tasks: getAgentTasks,
    run: runAgents,
    approve:
      approveAgentTask,
    reject:
      rejectAgentTask,
  },

  reports: {
    list: getReports,
    getAll: getReports,
    generate:
      generateReport,
  },

  settings: {
    get: getSettings,
    update:
      updateSettings,
    reseed:
      reseedDatabase,
  },

  auth: {
    login: (
      payload: {
        email: string;
        password: string;
      }
    ) =>
      request<{
        user: UserProfile;
        token: string;
        message: string;
      }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        }
      ),

    register: (
      payload: {
        fullName: string;
        email: string;
        password: string;
        role?: string;
        avatarUrl?: string;
      }
    ) =>
      request<{
        user: UserProfile;
        token: string;
        message: string;
      }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        }
      ),

    resetPassword: (
      payload: {
        token: string;
        newPassword: string;
      }
    ) =>
      request<{
        user: UserProfile;
        message: string;
      }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        }
      ),

    forgotPassword: (
      payload: {
        email: string;
      }
    ) =>
      request<{
        message: string;
        devLink?: string;
      }>(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        }
      ),

    logout: () =>
      request<{
        message: string;
      }>(
        "/auth/logout",
        {
          method: "POST",
        }
      ),

    switchUser: (
      userId: string
    ) =>
      request<{
        user: UserProfile;
        token: string;
        message: string;
      }>(
        "/auth/switch",
        {
          method: "POST",
          body: JSON.stringify({
            userId,
          }),
        }
      ),

    getUsers: () =>
      request<UserProfile[]>(
        "/auth/users"
      ),

    getMe: () =>
      request<UserProfile>(
        "/auth/me"
      ),
  },
};