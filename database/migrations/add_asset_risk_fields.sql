-- ============================================================================
-- Migration: Add factual asset attributes + calculated risk fields
-- RiskLens — v2 Asset Risk Assessment Columns
-- ============================================================================
-- Run this against the live Supabase (or local Postgres) database ONCE.
-- Safe to run on existing data: all columns have DEFAULT values.
-- ============================================================================

ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS environment             VARCHAR(32)    DEFAULT 'Production',
  ADD COLUMN IF NOT EXISTS internet_exposed        BOOLEAN        DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contains_sensitive_data BOOLEAN        DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS business_importance     VARCHAR(32)    DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS risk_score              NUMERIC(5, 2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level              VARCHAR(32)    DEFAULT 'Medium';

-- Index for efficient risk-level filtering used by the dashboard
CREATE INDEX IF NOT EXISTS idx_assets_risk_level ON assets(risk_level);

-- Backfill existing assets with plausible defaults based on existing criticality
-- so that existing assets display a risk_level immediately.
UPDATE assets
SET
  risk_level = CASE
    WHEN criticality = 'Critical' THEN 'High'
    WHEN criticality = 'High'     THEN 'Medium'
    WHEN criticality = 'Medium'   THEN 'Medium'
    ELSE                               'Low'
  END,
  risk_score = CASE
    WHEN criticality = 'Critical' THEN 70
    WHEN criticality = 'High'     THEN 50
    WHEN criticality = 'Medium'   THEN 30
    ELSE                               10
  END
WHERE risk_score = 0;
