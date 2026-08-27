export type AssetRiskAttributes = {
  business_importance:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

  environment:
    | "Production"
    | "Staging"
    | "Development"
    | "Sandbox";

  internet_exposed: boolean;

  contains_sensitive_data: boolean;

  asset_type?: string;
};

export type AssetRiskResult = {
  criticality:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

  risk_score: number;

  risk_level:
    | "Critical"
    | "High"
    | "Medium"
    | "Low";

  score_breakdown: {
    business_importance_pts: number;
    environment_pts: number;
    internet_exposed_pts: number;
    sensitive_data_pts: number;
    asset_type_pts: number;
    total: number;
  };
};

const BUSINESS_IMPORTANCE_SCORES: Record<
  string,
  number
> = {
  Critical: 35,
  High: 25,
  Medium: 15,
  Low: 5,
};

const ENVIRONMENT_SCORES: Record<
  string,
  number
> = {
  Production: 30,
  Staging: 15,
  Development: 5,
  Sandbox: 0,
};

const ASSET_TYPE_SCORES: Record<
  string,
  number
> = {
  database: 10,
  "cloud-resource": 8,
  "network-device": 8,
  server: 6,
  application: 5,
  endpoint: 3,
};

export const AssetRiskEngine = {
  calculateAssetRisk(
    attrs: AssetRiskAttributes
  ): AssetRiskResult {
    const business_importance_pts =
      BUSINESS_IMPORTANCE_SCORES[
        attrs.business_importance
      ] ?? 15;

    const environment_pts =
      ENVIRONMENT_SCORES[
        attrs.environment
      ] ?? 5;

    const internet_exposed_pts =
      attrs.internet_exposed
        ? 25
        : 0;

    const sensitive_data_pts =
      attrs.contains_sensitive_data
        ? 10
        : 0;

    const assetType =
      String(
        attrs.asset_type ||
          "server"
      ).toLowerCase();

    let asset_type_pts =
      ASSET_TYPE_SCORES[
        assetType
      ] ?? 0;

    if (
      assetType === "database" &&
      attrs.internet_exposed
    ) {
      asset_type_pts += 5;
    }

    if (
      assetType ===
        "network-device" &&
      attrs.internet_exposed
    ) {
      asset_type_pts += 3;
    }

    if (
      assetType ===
        "application" &&
      attrs.internet_exposed
    ) {
      asset_type_pts += 3;
    }

    const rawScore =
      business_importance_pts +
      environment_pts +
      internet_exposed_pts +
      sensitive_data_pts +
      asset_type_pts;

    const risk_score =
      Math.round(
        Math.min(
          100,
          rawScore
        ) * 10
      ) / 10;

    const criticality =
      this._mapCriticality(
        risk_score
      );

    const risk_level =
      this._mapRiskLevel(
        risk_score
      );

    return {
      criticality,

      risk_score,

      risk_level,

      score_breakdown: {
        business_importance_pts,
        environment_pts,
        internet_exposed_pts,
        sensitive_data_pts,
        asset_type_pts,
        total: risk_score,
      },
    };
  },

  _mapCriticality(
    score: number
  ):
    | "Critical"
    | "High"
    | "Medium"
    | "Low" {
    if (score >= 75) {
      return "Critical";
    }

    if (score >= 50) {
      return "High";
    }

    if (score >= 25) {
      return "Medium";
    }

    return "Low";
  },

  _mapRiskLevel(
    score: number
  ):
    | "Critical"
    | "High"
    | "Medium"
    | "Low" {
    if (score >= 80) {
      return "Critical";
    }

    if (score >= 60) {
      return "High";
    }

    if (score >= 35) {
      return "Medium";
    }

    return "Low";
  },
};