import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  AssetModel,
} from "../models/asset.model";

import {
  AgentModel,
} from "../models/agent.model";

import {
  AssetRiskEngine,
} from "../services/assetRisk.service";

import {
  RiskService,
} from "../services/risk.service";

/* ============================================================
   GET ASSETS
   ============================================================ */

export const getAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      type,
      criticality,
      status,
      search,
    } = req.query;

    const assets =
      await AssetModel.findAll(
        {
          type:
            type as string,

          criticality:
            criticality as string,

          status:
            status as string,

          search:
            search as string,
        }
      );

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET SINGLE ASSET
   ============================================================ */

export const getAssetById =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const asset =
        await AssetModel.findById(
          req.params.id
        );

      if (!asset) {
        res.status(404).json({
          success: false,

          error: {
            message:
              "Asset not found",

            code:
              "NOT_FOUND",
          },
        });

        return;
      }

      res.json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  };

/* ============================================================
   CREATE ASSET
   ============================================================ */

export const createAsset =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        name,

        asset_type,

        environment,

        internet_exposed,

        contains_sensitive_data,

        business_importance,

        ip_address,

        hostname,

        owner,

        status,

        location,

        tags,

        cloud_provider,

        region,

        resource_id,

        database_type,

        port,

        operating_system,

        management_ip_address,

        network_zone,

        application_url,
      } = req.body;

      /* ======================================================
         VALIDATION
         ====================================================== */

      if (
        !name ||
        !String(name).trim()
      ) {
        res.status(400).json({
          success: false,

          error: {
            message:
              "Asset name is required",

            code:
              "VALIDATION_ERROR",
          },
        });

        return;
      }

      const allowedTypes =
        [
          "server",
          "endpoint",
          "cloud-resource",
          "network-device",
          "database",
          "application",
        ];

      if (
        !allowedTypes.includes(
          asset_type
        )
      ) {
        res.status(400).json({
          success: false,

          error: {
            message:
              "Valid asset type is required",

            code:
              "VALIDATION_ERROR",
          },
        });

        return;
      }

      /* ======================================================
         NORMALIZE FACTUAL INPUTS
         ====================================================== */

      const normalizedEnvironment =
        environment ||
        "Production";

      const normalizedBusinessImportance =
        business_importance ||
        "Medium";

      const normalizedInternetExposed =
        Boolean(
          internet_exposed
        );

      const normalizedSensitiveData =
        Boolean(
          contains_sensitive_data
        );

      /* ======================================================
         CALCULATE RISK
         ====================================================== */

      const riskResult =
        AssetRiskEngine.calculateAssetRisk(
          {
            business_importance:
              normalizedBusinessImportance,

            environment:
              normalizedEnvironment,

            internet_exposed:
              normalizedInternetExposed,

            contains_sensitive_data:
              normalizedSensitiveData,

            asset_type,
          }
        );

      /* ======================================================
         SAVE
         ====================================================== */

      const asset =
        await AssetModel.create(
          {
            name:
              String(name).trim(),

            asset_type,

            ip_address:
              ip_address ||
              undefined,

            hostname:
              hostname ||
              undefined,

            criticality:
              riskResult.criticality,

            risk_score:
              riskResult.risk_score,

            risk_level:
              riskResult.risk_level,

            owner:
              owner ||
              "SecOps Infrastructure Team",

            status:
              status ||
              "Active",

            location:
              location ||
              undefined,

            tags:
              Array.isArray(tags)
                ? tags
                : [],

            environment:
              normalizedEnvironment,

            internet_exposed:
              normalizedInternetExposed,

            contains_sensitive_data:
              normalizedSensitiveData,

            business_importance:
              normalizedBusinessImportance,

            cloud_provider:
              cloud_provider ||
              undefined,

            region:
              region ||
              undefined,

            resource_id:
              resource_id ||
              undefined,

            database_type:
              database_type ||
              undefined,

            port:
              port ===
                null ||
              port ===
                undefined ||
              port === ""
                ? undefined
                : Number(port),

            operating_system:
              operating_system ||
              undefined,

            management_ip_address:
              management_ip_address ||
              undefined,

            network_zone:
              network_zone ||
              undefined,

            application_url:
              application_url ||
              undefined,
          }
        );

      /* ======================================================
         RECALCULATE ORGANIZATION RISK
         ====================================================== */

      RiskService
        .calculateCurrentRisk()
        .catch(
          (error) =>
            console.error(
              "[AssetCreated] Risk recalculation failed:",
              error
            )
        );

      /* ======================================================
         AUDIT
         ====================================================== */

      await AgentModel.logAudit(
        {
          user_id:
            req.user?.id,

          action:
            "ASSET_CREATED",

          entity_type:
            "asset",

          entity_id:
            asset.id,

          details: {
            name:
              asset.name,

            assetType:
              asset.asset_type,

            calculatedCriticality:
              riskResult.criticality,

            calculatedRiskLevel:
              riskResult.risk_level,

            riskScore:
              riskResult.risk_score,

            scoreBreakdown:
              riskResult.score_breakdown,
          },
        }
      );

      /* ======================================================
         RESPONSE
         ====================================================== */

      res.status(201).json({
        success: true,

        data: {
          asset,

          calculatedCriticality:
            riskResult.criticality,

          calculatedRiskLevel:
            riskResult.risk_level,

          riskScore:
            riskResult.risk_score,

          scoreBreakdown:
            riskResult.score_breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/* ============================================================
   UPDATE ASSET
   ============================================================ */

export const updateAsset =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      /*
       * Never trust calculated fields
       * sent from frontend.
       */

      const {
        criticality: _criticality,
        risk_score: _riskScore,
        risk_level: _riskLevel,
        ...safeData
      } = req.body;

      void _criticality;
      void _riskScore;
      void _riskLevel;

      const updated =
        await AssetModel.update(
          req.params.id,
          safeData
        );

      if (!updated) {
        res.status(404).json({
          success: false,

          error: {
            message:
              "Asset not found",

            code:
              "NOT_FOUND",
          },
        });

        return;
      }

      RiskService
        .calculateCurrentRisk()
        .catch(
          (error) =>
            console.error(
              "[AssetUpdated] Risk recalculation failed:",
              error
            )
        );

      await AgentModel.logAudit(
        {
          user_id:
            req.user?.id,

          action:
            "ASSET_UPDATED",

          entity_type:
            "asset",

          entity_id:
            updated.id,

          details: {
            ...safeData,

            calculatedCriticality:
              updated.criticality,

            calculatedRiskLevel:
              updated.risk_level,

            riskScore:
              updated.risk_score,
          },
        }
      );

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

/* ============================================================
   DELETE ASSET
   ============================================================ */

export const deleteAsset =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deleted =
        await AssetModel.delete(
          req.params.id
        );

      if (!deleted) {
        res.status(404).json({
          success: false,

          error: {
            message:
              "Asset not found",

            code:
              "NOT_FOUND",
          },
        });

        return;
      }

      await AgentModel.logAudit(
        {
          user_id:
            req.user?.id,

          action:
            "ASSET_DELETED",

          entity_type:
            "asset",

          entity_id:
            req.params.id,
        }
      );

      RiskService
        .calculateCurrentRisk()
        .catch(
          (error) =>
            console.error(
              "[AssetDeleted] Risk recalculation failed:",
              error
            )
        );

      res.json({
        success: true,

        data: {
          id:
            req.params.id,

          deleted: true,
        },
      });
    } catch (error) {
      next(error);
    }
  };