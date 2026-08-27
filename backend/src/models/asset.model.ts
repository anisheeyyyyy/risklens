import { query } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { AssetRiskEngine } from "../services/assetRisk.service";

export interface Asset {
  id: string;

  name: string;

  asset_type:
    | "server"
    | "endpoint"
    | "cloud-resource"
    | "network-device"
    | "database"
    | "application";

  ip_address?: string;

  hostname?: string;

  criticality:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

  owner: string;

  status:
    | "Active"
    | "Under Maintenance"
    | "Isolated"
    | "Decommissioned";

  environment?:
    | "Production"
    | "Staging"
    | "Development"
    | "Sandbox";

  internet_exposed?: boolean;

  contains_sensitive_data?: boolean;

  business_importance?:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

  /* Type specific */

  cloud_provider?: string;

  region?: string;

  resource_id?: string;

  database_type?: string;

  port?: number;

  operating_system?: string;

  management_ip_address?: string;

  network_zone?: string;

  application_url?: string;

  location?: string;

  tags?: string[];

  risk_score?: number;

  risk_level?:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

  last_scanned_at?: string;

  created_at: string;

  updated_at: string;

  vulnerability_count?: number;

  threat_count?: number;
}

export const AssetModel = {
  async findAll(
    filters: {
      type?: string;
      criticality?: string;
      status?: string;
      search?: string;
    } = {}
  ): Promise<Asset[]> {
    let sql = `
      SELECT *
      FROM assets
      WHERE 1 = 1
    `;

    const params: any[] = [];

    let paramIndex = 1;

    if (filters.type) {
      sql += `
        AND asset_type = $${paramIndex++}
      `;

      params.push(
        filters.type
      );
    }

    if (filters.criticality) {
      sql += `
        AND criticality = $${paramIndex++}
      `;

      params.push(
        filters.criticality
      );
    }

    if (filters.status) {
      sql += `
        AND status = $${paramIndex++}
      `;

      params.push(
        filters.status
      );
    }

    if (filters.search) {
      sql += `
        AND (
          name ILIKE $${paramIndex}
          OR hostname ILIKE $${paramIndex}
          OR ip_address ILIKE $${paramIndex}
        )
      `;

      params.push(
        `%${filters.search}%`
      );

      paramIndex++;
    }

    sql += `
      ORDER BY created_at DESC
    `;

    const [
      assetRes,
      vulnRes,
      threatRes,
    ] = await Promise.all([
      query<Asset>(
        sql,
        params
      ),

      query(
        `
        SELECT asset_id
        FROM vulnerabilities
        WHERE status != $1
        `,
        ["Resolved"]
      ),

      query(
        `
        SELECT asset_id
        FROM threats
        WHERE status NOT IN ($1, $2)
        `,
        [
          "Mitigated",
          "Contained",
        ]
      ),
    ]);

    const vulnsByAsset =
      new Map<string, number>();

    for (const item of vulnRes.rows) {
      if (item.asset_id) {
        vulnsByAsset.set(
          item.asset_id,
          (
            vulnsByAsset.get(
              item.asset_id
            ) || 0
          ) + 1
        );
      }
    }

    const threatsByAsset =
      new Map<string, number>();

    for (const item of threatRes.rows) {
      if (item.asset_id) {
        threatsByAsset.set(
          item.asset_id,
          (
            threatsByAsset.get(
              item.asset_id
            ) || 0
          ) + 1
        );
      }
    }

    const assets =
      assetRes.rows.map(
        (asset) => ({
          ...asset,

          vulnerability_count:
            vulnsByAsset.get(
              asset.id
            ) || 0,

          threat_count:
            threatsByAsset.get(
              asset.id
            ) || 0,
        })
      );

    return assets;
  },

  async findById(
    id: string
  ): Promise<Asset | null> {
    const result =
      await query<Asset>(
        `
        SELECT *
        FROM assets
        WHERE id = $1
        `,
        [id]
      );

    if (!result.rows[0]) {
      return null;
    }

    return result.rows[0];
  },

  async create(
    data: {
      name: string;
      asset_type: string;

      ip_address?: string;
      hostname?: string;

      criticality: string;

      owner: string;

      status?: string;

      location?: string;

      tags?: string[];

      environment?: string;

      internet_exposed?: boolean;

      contains_sensitive_data?: boolean;

      business_importance?: string;

      cloud_provider?: string;

      region?: string;

      resource_id?: string;

      database_type?: string;

      port?: number;

      operating_system?: string;

      management_ip_address?: string;

      network_zone?: string;

      application_url?: string;

      risk_score?: number;

      risk_level?: string;
    }
  ): Promise<Asset> {
    const id =
      `ast-${uuidv4().substring(0, 8)}`;

    const sql = `
      INSERT INTO assets (
        id,
        name,
        asset_type,
        ip_address,
        hostname,
        criticality,
        owner,
        status,
        environment,
        internet_exposed,
        contains_sensitive_data,
        business_importance,

        cloud_provider,
        region,
        resource_id,
        database_type,
        port,
        operating_system,
        management_ip_address,
        network_zone,
        application_url,

        location,
        tags,

        risk_score,
        risk_level,
        last_scanned_at
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,

        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,

        $22,
        $23,

        $24,
        $25,
        NOW()
      )

      RETURNING *
    `;

    const result =
      await query<Asset>(
        sql,
        [
          id,

          data.name,

          data.asset_type,

          data.ip_address ||
            null,

          data.hostname ||
            null,

          data.criticality,

          data.owner,

          data.status ||
            "Active",

          data.environment ||
            "Production",

          data.internet_exposed ??
            false,

          data.contains_sensitive_data ??
            false,

          data.business_importance ||
            "Medium",

          data.cloud_provider ||
            null,

          data.region ||
            null,

          data.resource_id ||
            null,

          data.database_type ||
            null,

          data.port ??
            null,

          data.operating_system ||
            null,

          data.management_ip_address ||
            null,

          data.network_zone ||
            null,

          data.application_url ||
            null,

          data.location ||
            null,

          data.tags ||
            [],

          data.risk_score ??
            0,

          data.risk_level ||
            "Medium",
        ]
      );

    return result.rows[0];
  },

  async update(
    id: string,
    data: Partial<Asset>
  ): Promise<Asset | null> {
    const current =
      await this.findById(id);

    if (!current) {
      return null;
    }

    const asset_type =
      (
        data.asset_type ??
        current.asset_type
      ) as Asset[
        "asset_type"
      ];

    const environment =
      (
        data.environment ??
        current.environment ??
        "Production"
      ) as Asset[
        "environment"
      ];

    const business_importance =
      (
        data.business_importance ??
        current.business_importance ??
        "Medium"
      ) as Asset[
        "business_importance"
      ];

    const internet_exposed =
      data.internet_exposed ??
      Boolean(
        current.internet_exposed
      );

    const contains_sensitive_data =
      data.contains_sensitive_data ??
      Boolean(
        current.contains_sensitive_data
      );

    const riskResult =
      AssetRiskEngine.calculateAssetRisk(
        {
          business_importance:
            business_importance ||
            "Medium",

          environment:
            environment ||
            "Production",

          internet_exposed,

          contains_sensitive_data,

          asset_type,
        }
      );

    const result =
      await query<Asset>(
        `
        UPDATE assets
        SET
          name = $1,
          asset_type = $2,
          ip_address = $3,
          hostname = $4,

          criticality = $5,

          owner = $6,
          status = $7,

          environment = $8,
          internet_exposed = $9,
          contains_sensitive_data = $10,
          business_importance = $11,

          cloud_provider = $12,
          region = $13,
          resource_id = $14,
          database_type = $15,
          port = $16,
          operating_system = $17,
          management_ip_address = $18,
          network_zone = $19,
          application_url = $20,

          location = $21,
          tags = $22,

          risk_score = $23,
          risk_level = $24,

          updated_at = NOW()

        WHERE id = $25

        RETURNING *
        `,
        [
          data.name ??
            current.name,

          asset_type,

          data.ip_address ??
            current.ip_address ??
            null,

          data.hostname ??
            current.hostname ??
            null,

          riskResult.criticality,

          data.owner ??
            current.owner,

          data.status ??
            current.status,

          environment,

          internet_exposed,

          contains_sensitive_data,

          business_importance,

          data.cloud_provider ??
            current.cloud_provider ??
            null,

          data.region ??
            current.region ??
            null,

          data.resource_id ??
            current.resource_id ??
            null,

          data.database_type ??
            current.database_type ??
            null,

          data.port ??
            current.port ??
            null,

          data.operating_system ??
            current.operating_system ??
            null,

          data.management_ip_address ??
            current.management_ip_address ??
            null,

          data.network_zone ??
            current.network_zone ??
            null,

          data.application_url ??
            current.application_url ??
            null,

          data.location ??
            current.location ??
            null,

          data.tags ??
            current.tags ??
            [],

          riskResult.risk_score,

          riskResult.risk_level,

          id,
        ]
      );

    return (
      result.rows[0] ||
      null
    );
  },

  async delete(
    id: string
  ): Promise<boolean> {
    const result =
      await query(
        `
        DELETE FROM assets
        WHERE id = $1
        `,
        [id]
      );

    return (
      (result.rowCount ??
        0) > 0
    );
  },

  async count(): Promise<{
    total: number;
    critical: number;
    active: number;
  }> {
    const result =
      await query(
        `
        SELECT
          COUNT(*) AS total,

          COUNT(*) FILTER (
            WHERE criticality = 'Critical'
          ) AS critical,

          COUNT(*) FILTER (
            WHERE status = 'Active'
          ) AS active

        FROM assets
        `
      );

    const row =
      result.rows[0];

    return {
      total: Number(
        row.total || 0
      ),

      critical: Number(
        row.critical || 0
      ),

      active: Number(
        row.active || 0
      ),
    };
  },
};