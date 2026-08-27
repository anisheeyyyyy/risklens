import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  Server,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";

import {
  api,
  type Asset,
  type AssetCreateResult,
  type AssetCreateInput,
  recalculateRiskScore,
} from "../services/api";

/* ============================================================
   FORM TYPES
   ============================================================ */

type AssetFormInput = {
  name: string;

  asset_type: string;

  environment: string;

  internet_exposed: boolean;

  contains_sensitive_data: boolean;

  business_importance: string;

  status: string;

  hostname: string;

  ip_address: string;

  cloud_provider: string;

  region: string;

  resource_id: string;

  database_type: string;

  port?: number;

  operating_system: string;

  management_ip_address: string;

  network_zone: string;

  application_url: string;

  owner: string;

  location: string;
};

/* ============================================================
   EMPTY FORM
   ============================================================ */

const EMPTY_FORM: AssetFormInput = {
  name: "",

  asset_type: "server",

  environment: "Production",

  internet_exposed: false,

  contains_sensitive_data: false,

  business_importance: "Medium",

  status: "Active",

  hostname: "",

  ip_address: "",

  cloud_provider: "",

  region: "",

  resource_id: "",

  database_type: "",

  port: undefined,

  operating_system: "",

  management_ip_address: "",

  network_zone: "",

  application_url: "",

  owner: "",

  location: "",
};

/* ============================================================
   STYLE HELPERS
   ============================================================ */

function riskBadgeColor(
  level?: string
): string {
  switch (
    (level || "").toLowerCase()
  ) {
    case "critical":
      return "rgba(239,68,68,0.2)";

    case "high":
      return "rgba(249,115,22,0.2)";

    case "medium":
      return "rgba(234,179,8,0.2)";

    default:
      return "rgba(34,197,94,0.2)";
  }
}

function riskTextColor(
  level?: string
): string {
  switch (
    (level || "").toLowerCase()
  ) {
    case "critical":
      return "#ef4444";

    case "high":
      return "#f97316";

    case "medium":
      return "#eab308";

    default:
      return "#22c55e";
  }
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color:
    "var(--text-secondary, rgba(148,163,184,1))",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background:
    "rgba(255,255,255,0.05)",
  border:
    "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

/* ============================================================
   SELECT
   ============================================================ */

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;

  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={selectStyle}
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
              style={{
                background:
                  "#1e293b",
                color:
                  "white",
              }}
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* ============================================================
   TOGGLE
   ============================================================ */

function ToggleField({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;

  sublabel?: string;

  value: boolean;

  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <div
      onClick={() =>
        onChange(!value)
      }
      style={{
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
        padding:
          "10px 14px",
        background: value
          ? "rgba(99,102,241,0.12)"
          : "rgba(255,255,255,0.05)",
        border: `1px solid ${
          value
            ? "rgba(99,102,241,0.4)"
            : "rgba(255,255,255,0.12)"
        }`,
        borderRadius: 8,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "white",
          }}
        >
          {label}
        </div>

        {sublabel && (
          <div
            style={{
              fontSize: 11,
              color:
                "rgba(148,163,184,0.8)",
              marginTop: 2,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>

      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: value
            ? "#6366f1"
            : "rgba(100,116,139,0.4)",
          position:
            "relative",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "white",
            position:
              "absolute",
            top: 3,
            left: value ? 21 : 3,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   TEXT / NUMBER FIELD

   Restrict field key to fields that can actually be rendered
   by <input>. This removes the string|number|boolean TS error.
   ============================================================ */

type AssetInputField =
  | "hostname"
  | "ip_address"
  | "cloud_provider"
  | "region"
  | "resource_id"
  | "database_type"
  | "port"
  | "operating_system"
  | "management_ip_address"
  | "network_zone"
  | "application_url"
  | "owner"
  | "location";

function AssetField({
  label,
  field,
  form,
  setForm,
  placeholder,
  type = "text",
}: {
  label: string;

  field: AssetInputField;

  form: AssetFormInput;

  setForm: React.Dispatch<
    React.SetStateAction<AssetFormInput>
  >;

  placeholder?: string;

  type?: "text" | "number" | "url";
}) {
  const value =
    form[field];

  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        value={
          value ?? ""
        }
        onChange={(event) => {
          const raw =
            event.target.value;

          setForm(
            (previous) => ({
              ...previous,

              [field]:
                type ===
                "number"
                  ? raw === ""
                    ? undefined
                    : Number(raw)
                  : raw,
            })
          );
        }}
        placeholder={
          placeholder
        }
        style={
          inputStyle
        }
      />
    </div>
  );
}

/* ============================================================
   TYPE-SPECIFIC FIELDS
   ============================================================ */

function TypeSpecificFields({
  form,
  setForm,
}: {
  form: AssetFormInput;

  setForm: React.Dispatch<
    React.SetStateAction<AssetFormInput>
  >;
}) {
  const gridStyle: React.CSSProperties =
    {
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: 14,
    };

  if (
    form.asset_type ===
    "server"
  ) {
    return (
      <div
        style={gridStyle}
      >
        <AssetField
          label="HOSTNAME"
          field="hostname"
          form={form}
          setForm={
            setForm
          }
          placeholder="prod-web-01"
        />

        <AssetField
          label="IP ADDRESS"
          field="ip_address"
          form={form}
          setForm={
            setForm
          }
          placeholder="192.168.1.10"
        />

        <AssetField
          label="OPERATING SYSTEM"
          field="operating_system"
          form={form}
          setForm={
            setForm
          }
          placeholder="Ubuntu 24.04"
        />

        <AssetField
          label="PORT"
          field="port"
          form={form}
          setForm={
            setForm
          }
          type="number"
          placeholder="443"
        />
      </div>
    );
  }

  if (
    form.asset_type ===
    "endpoint"
  ) {
    return (
      <div
        style={gridStyle}
      >
        <AssetField
          label="HOSTNAME"
          field="hostname"
          form={form}
          setForm={
            setForm
          }
          placeholder="employee-laptop-01"
        />

        <AssetField
          label="IP ADDRESS"
          field="ip_address"
          form={form}
          setForm={
            setForm
          }
          placeholder="192.168.1.20"
        />

        <AssetField
          label="OPERATING SYSTEM"
          field="operating_system"
          form={form}
          setForm={
            setForm
          }
          placeholder="Windows 11"
        />
      </div>
    );
  }

  if (
    form.asset_type ===
    "cloud-resource"
  ) {
    return (
      <div
        style={gridStyle}
      >
        <AssetField
          label="CLOUD PROVIDER"
          field="cloud_provider"
          form={form}
          setForm={
            setForm
          }
          placeholder="AWS / Azure / GCP"
        />

        <AssetField
          label="REGION"
          field="region"
          form={form}
          setForm={
            setForm
          }
          placeholder="ap-south-1"
        />

        <AssetField
          label="RESOURCE ID"
          field="resource_id"
          form={form}
          setForm={
            setForm
          }
          placeholder="resource-123"
        />
      </div>
    );
  }

  if (
    form.asset_type ===
    "network-device"
  ) {
    return (
      <div
        style={gridStyle}
      >
        <AssetField
          label="HOSTNAME"
          field="hostname"
          form={form}
          setForm={
            setForm
          }
          placeholder="core-router-01"
        />

        <AssetField
          label="IP ADDRESS"
          field="ip_address"
          form={form}
          setForm={
            setForm
          }
          placeholder="10.0.0.1"
        />

        <AssetField
          label="MANAGEMENT IP ADDRESS"
          field="management_ip_address"
          form={form}
          setForm={
            setForm
          }
          placeholder="10.0.0.10"
        />

        <AssetField
          label="NETWORK ZONE"
          field="network_zone"
          form={form}
          setForm={
            setForm
          }
          placeholder="DMZ"
        />

        <AssetField
          label="OPERATING SYSTEM"
          field="operating_system"
          form={form}
          setForm={
            setForm
          }
          placeholder="Cisco IOS"
        />

        <AssetField
          label="PORT"
          field="port"
          form={form}
          setForm={
            setForm
          }
          type="number"
          placeholder="443"
        />
      </div>
    );
  }

  if (
    form.asset_type ===
    "database"
  ) {
    return (
      <div
        style={gridStyle}
      >
        <AssetField
          label="HOSTNAME"
          field="hostname"
          form={form}
          setForm={
            setForm
          }
          placeholder="prod-db-01"
        />

        <AssetField
          label="IP ADDRESS"
          field="ip_address"
          form={form}
          setForm={
            setForm
          }
          placeholder="10.0.1.20"
        />

        <AssetField
          label="DATABASE TYPE"
          field="database_type"
          form={form}
          setForm={
            setForm
          }
          placeholder="PostgreSQL"
        />

        <AssetField
          label="PORT"
          field="port"
          form={form}
          setForm={
            setForm
          }
          type="number"
          placeholder="5432"
        />
      </div>
    );
  }

  if (
    form.asset_type ===
    "application"
  ) {
    return (
      <div
        style={gridStyle}
      >
        <AssetField
          label="APPLICATION URL"
          field="application_url"
          form={form}
          setForm={
            setForm
          }
          type="url"
          placeholder="https://app.example.com"
        />

        <AssetField
          label="HOSTNAME"
          field="hostname"
          form={form}
          setForm={
            setForm
          }
          placeholder="app-server-01"
        />

        <AssetField
          label="IP ADDRESS"
          field="ip_address"
          form={form}
          setForm={
            setForm
          }
          placeholder="10.0.2.10"
        />

        <AssetField
          label="PORT"
          field="port"
          form={form}
          setForm={
            setForm
          }
          type="number"
          placeholder="443"
        />
      </div>
    );
  }

  return null;
}

/* ============================================================
   RESULT BANNER
   ============================================================ */

function CreationResultBanner({
  result,
  assetName,
  onDismiss,
}: {
  result: AssetCreateResult;

  assetName: string;

  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        background:
          "rgba(34,197,94,0.08)",

        border:
          "1px solid rgba(34,197,94,0.3)",

        borderRadius: 10,

        padding:
          "16px 18px",
      }}
    >
      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap: 8,

          marginBottom: 10,
        }}
      >
        <CheckCircle2
          size={18}
          color="#22c55e"
        />

        <span
          style={{
            fontWeight: 700,
            color: "#22c55e",
            fontSize: 14,
          }}
        >
          Asset added successfully
        </span>

        <button
          className="icon-button"
          onClick={
            onDismiss
          }
          style={{
            marginLeft:
              "auto",
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr 1fr",

          gap: 10,
        }}
      >
        <ResultBox
          label="Asset"
          value={
            assetName
          }
        />

        <ResultBox
          label="Calculated Criticality"
          value={
            result.calculatedCriticality
          }
          color={riskTextColor(
            result.calculatedCriticality
          )}
        />

        <ResultBox
          label="Calculated Risk Level"
          value={
            result.calculatedRiskLevel
          }
          color={riskTextColor(
            result.calculatedRiskLevel
          )}
        />
      </div>

      {result.scoreBreakdown && (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color:
              "rgba(148,163,184,0.8)",
            lineHeight: 1.7,
          }}
        >
          <div>
            Risk Score:{" "}
            {
              result.riskScore
            }
            /100
          </div>

          <div>
            Business Importance:{" "}
            {
              result.scoreBreakdown
                .business_importance_pts
            }
            pts
          </div>

          <div>
            Environment:{" "}
            {
              result.scoreBreakdown
                .environment_pts
            }
            pts
          </div>

          <div>
            Internet Exposed:{" "}
            {
              result.scoreBreakdown
                .internet_exposed_pts
            }
            pts
          </div>

          <div>
            Sensitive Data:{" "}
            {
              result.scoreBreakdown
                .sensitive_data_pts
            }
            pts
          </div>

          {result.scoreBreakdown
            .asset_type_pts !==
            undefined && (
            <div>
              Asset Type:{" "}
              {
                result.scoreBreakdown
                  .asset_type_pts
              }
              pts
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBox({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background:
          "rgba(0,0,0,0.2)",
        borderRadius: 6,
        padding:
          "8px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color:
            "rgba(148,163,184,0.8)",
          marginBottom: 3,
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   RISK PREVIEW
   ============================================================ */

function estimateRisk(
  form: AssetFormInput
) {
  const businessPoints: Record<
    string,
    number
  > = {
    Critical: 35,
    High: 25,
    Medium: 15,
    Low: 5,
  };

  const environmentPoints: Record<
    string,
    number
  > = {
    Production: 30,
    Staging: 15,
    Development: 5,
    Sandbox: 0,
  };

  const typePoints: Record<
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

  let score =
    (businessPoints[
      form.business_importance
    ] ?? 15) +
    (environmentPoints[
      form.environment
    ] ?? 5) +
    (form.internet_exposed
      ? 25
      : 0) +
    (form.contains_sensitive_data
      ? 10
      : 0) +
    (typePoints[
      form.asset_type
    ] ?? 0);

  if (
    form.asset_type ===
      "database" &&
    form.internet_exposed
  ) {
    score += 5;
  }

  if (
    form.asset_type ===
      "network-device" &&
    form.internet_exposed
  ) {
    score += 3;
  }

  if (
    form.asset_type ===
      "application" &&
    form.internet_exposed
  ) {
    score += 3;
  }

  score = Math.min(
    100,
    score
  );

  const criticality =
    score >= 75
      ? "Critical"
      : score >= 50
        ? "High"
        : score >= 25
          ? "Medium"
          : "Low";

  const riskLevel =
    score >= 80
      ? "Critical"
      : score >= 60
        ? "High"
        : score >= 35
          ? "Medium"
          : "Low";

  return {
    score,
    criticality,
    riskLevel,
  };
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export function Assets() {
  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const [
    editingAsset,
    setEditingAsset,
  ] =
    useState<Asset | null>(
      null
    );

  const [form, setForm] =
    useState<AssetFormInput>(
      EMPTY_FORM
    );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    creationResult,
    setCreationResult,
  ] =
    useState<AssetCreateResult | null>(
      null
    );

  /* ========================================================
     LOAD
     ======================================================== */

  async function loadAssets() {
    try {
      setError("");

      const data =
        await api.assets.getAll();

      setAssets(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load assets"
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  /* ========================================================
     SEARCH
     ======================================================== */

  const filteredAssets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return assets;
      }

      return assets.filter(
        (asset) =>
          [
            asset.name,
            asset.type,
            asset.asset_type,
            asset.status,
            asset.criticality,
            asset.riskLevel,
            asset.risk_level,
            asset.environment,
            asset.business_importance,
            asset.hostname,
            asset.ip_address,
            asset.cloud_provider,
            asset.region,
            asset.database_type,
            asset.operating_system,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query)
            )
      );
    }, [assets, search]);

  /* ========================================================
     DELETE
     ======================================================== */

  async function handleDelete(
    id: string
  ) {
    if (
      !window.confirm(
        "Are you sure you want to delete this asset?"
      )
    ) {
      return;
    }

    try {
      await api.assets.delete(
        id
      );

      await loadAssets();

      recalculateRiskScore().catch(
        console.error
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete asset"
      );
    }
  }

  /* ========================================================
     OPEN ADD
     ======================================================== */

  function handleOpenModal() {
    setEditingAsset(null);

    setForm({
      ...EMPTY_FORM,
    });

    setCreationResult(null);

    setIsAdding(true);
  }

  /* ========================================================
     OPEN EDIT
     ======================================================== */

  function handleOpenEditModal(
    asset: Asset
  ) {
    setEditingAsset(asset);

    setForm({
      name: asset.name || "",

      asset_type:
        asset.asset_type ||
        asset.type ||
        "server",

      environment:
        asset.environment ||
        "Production",

      internet_exposed:
        Boolean(
          asset.internet_exposed
        ),

      contains_sensitive_data:
        Boolean(
          asset.contains_sensitive_data
        ),

      business_importance:
        asset.business_importance ||
        "Medium",

      status:
        asset.status ||
        "Active",

      hostname:
        asset.hostname || "",

      ip_address:
        asset.ip_address || "",

      cloud_provider:
        asset.cloud_provider ||
        "",

      region:
        asset.region || "",

      resource_id:
        asset.resource_id ||
        "",

      database_type:
        asset.database_type ||
        "",

      port:
        asset.port,

      operating_system:
        asset.operating_system ||
        "",

      management_ip_address:
        asset.management_ip_address ||
        "",

      network_zone:
        asset.network_zone ||
        "",

      application_url:
        asset.application_url ||
        "",

      owner:
        asset.owner || "",

      location:
        asset.location || "",
    });

    setCreationResult(null);
  }

  /* ========================================================
     CLOSE
     ======================================================== */

  function handleCloseModal() {
    if (submitting) {
      return;
    }

    setIsAdding(false);

    setEditingAsset(null);

    setCreationResult(null);

    setForm({
      ...EMPTY_FORM,
    });
  }

  /* ========================================================
     SAVE
     ======================================================== */

  async function handleSaveAsset(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert(
        "Asset name is required."
      );
      return;
    }

    setSubmitting(true);

    setError("");

    try {
      const payload:
        AssetCreateInput = {
        name:
          form.name.trim(),

        asset_type:
          form.asset_type,

        status:
          form.status,

        environment:
          form.environment,

        internet_exposed:
          form.internet_exposed,

        contains_sensitive_data:
          form.contains_sensitive_data,

        business_importance:
          form.business_importance,

        hostname:
          form.hostname ||
          undefined,

        ip_address:
          form.ip_address ||
          undefined,

        cloud_provider:
          form.cloud_provider ||
          undefined,

        region:
          form.region ||
          undefined,

        resource_id:
          form.resource_id ||
          undefined,

        database_type:
          form.database_type ||
          undefined,

        port:
          form.port,

        operating_system:
          form.operating_system ||
          undefined,

        management_ip_address:
          form.management_ip_address ||
          undefined,

        network_zone:
          form.network_zone ||
          undefined,

        application_url:
          form.application_url ||
          undefined,

        owner:
          form.owner ||
          undefined,

        location:
          form.location ||
          undefined,
      };

      /* ----------------------------------------------------
         UPDATE
         ---------------------------------------------------- */

      if (editingAsset) {
        await api.assets.update(
          editingAsset.id,
          payload
        );

        await loadAssets();

        recalculateRiskScore().catch(
          console.error
        );

        handleCloseModal();

        return;
      }

      /* ----------------------------------------------------
         CREATE
         ---------------------------------------------------- */

      const result =
        await api.assets.create(
          payload
        );

      setCreationResult(
        result
      );

      await loadAssets();

      recalculateRiskScore().catch(
        console.error
      );
    } catch (err) {
      console.error(
        "Save asset error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Failed to save asset";

      setError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  const preview =
    estimateRisk(form);

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <section className="content">

      {/* HEADER */}

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            LIVE ASSET INVENTORY
          </p>

          <h3>
            Asset Management
          </h3>

          <p>
            Manage organizational
            assets and calculate
            security risk automatically.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            className="scan-button"
            disabled={
              refreshing
            }
            onClick={async () => {
              setRefreshing(true);
              await loadAssets();
            }}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="scan-button"
            onClick={
              handleOpenModal
            }
          >
            <Plus size={16} />

            Add Asset
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="error-screen">

          <AlertTriangle
            size={22}
          />

          <div>
            <strong>
              Asset data error
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            className="scan-button"
            onClick={
              loadAssets
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* STATS */}

      <div className="stats-grid">

        <StatCard
          icon={
            <Server size={20} />
          }
          title="Total Assets"
          value={
            assets.length
          }
          type="blue"
        />

        <StatCard
          icon={
            <ShieldCheck
              size={20}
            />
          }
          title="Protected"
          value={
            assets.filter(
              (asset) =>
                String(
                  asset.status
                ).toLowerCase() ===
                "protected"
            ).length
          }
          type="green"
        />

        <StatCard
          icon={
            <AlertTriangle
              size={20}
            />
          }
          title="At Risk"
          value={
            assets.filter(
              (asset) => {
                const level =
                  String(
                    asset.risk_level ||
                      asset.riskLevel ||
                      ""
                  ).toLowerCase();

                return (
                  level ===
                    "high" ||
                  level ===
                    "critical"
                );
              }
            ).length
          }
          type="orange"
        />

        <StatCard
          icon={
            <Server size={20} />
          }
          title="Critical Assets"
          value={
            assets.filter(
              (asset) =>
                String(
                  asset.criticality ||
                    ""
                ).toLowerCase() ===
                "critical"
            ).length
          }
          type="purple"
        />

      </div>

      {/* SEARCH */}

      <div className="panel">
        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: 12,
          }}
        >
          <Search size={18} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search assets..."
            style={{
              flex: 1,
              background:
                "transparent",
              border: "none",
              outline:
                "none",
              color:
                "inherit",
            }}
          />

          <span className="card-label">
            {
              filteredAssets.length
            }{" "}
            RESULTS
          </span>
        </div>
      </div>

      {/* TABLE */}

      <div className="panel table-panel">

        <div className="panel-header">

          <div>
            <span className="card-label">
              SUPABASE DATABASE
            </span>

            <h4>
              Organization Assets
            </h4>
          </div>

        </div>

        {loading ? (
          <div className="loading-screen">
            Loading live assets...
          </div>
        ) : filteredAssets.length ===
          0 ? (
          <div className="loading-screen">
            No assets found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>
                    Asset
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Criticality
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Risk
                  </th>

                  <th>
                    Last Scan
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredAssets.map(
                  (asset) => (
                    <tr
                      key={
                        asset.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            asset.name
                          }
                        </strong>

                        {asset.hostname && (
                          <div
                            style={{
                              fontSize: 11,
                              opacity: 0.6,
                              marginTop: 3,
                            }}
                          >
                            {
                              asset.hostname
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        {
                          asset.asset_type ||
                          asset.type ||
                          "—"
                        }
                      </td>

                      <td>
                        <span
                          className="table-status"
                          style={{
                            background:
                              riskBadgeColor(
                                asset.criticality
                              ),

                            color:
                              riskTextColor(
                                asset.criticality
                              ),

                            border:
                              `1px solid ${riskTextColor(
                                asset.criticality
                              )}33`,
                          }}
                        >
                          {
                            asset.criticality ||
                            "—"
                          }
                        </span>
                      </td>

                      <td>
                        <span className="table-status">
                          {
                            asset.status ||
                            "—"
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className="table-status"
                          style={{
                            background:
                              riskBadgeColor(
                                asset.risk_level ||
                                  asset.riskLevel
                              ),

                            color:
                              riskTextColor(
                                asset.risk_level ||
                                  asset.riskLevel
                              ),
                          }}
                        >
                          {
                            asset.risk_level ||
                            asset.riskLevel ||
                            "—"
                          }

                          {typeof asset.risk_score ===
                            "number" && (
                            <span
                              style={{
                                marginLeft: 6,
                                opacity: 0.8,
                              }}
                            >
                              {asset.risk_score}
                            </span>
                          )}
                        </span>
                      </td>

                      <td>
                        {
                          asset.last_scanned_at ||
                          asset.lastScan ||
                          "—"
                        }
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 8,
                          }}
                        >

                          <button
                            className="icon-button"
                            title="Edit asset"
                            onClick={() =>
                              handleOpenEditModal(
                                asset
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            className="icon-button"
                            title="Delete asset"
                            onClick={() =>
                              handleDelete(
                                asset.id
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ======================================================
          MODAL
          ====================================================== */}

      {(isAdding ||
        editingAsset) && (
        <div
          className="modal-overlay"
          style={{
            position:
              "fixed",

            inset: 0,

            backgroundColor:
              "rgba(0,0,0,0.75)",

            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            zIndex:
              1000,

            backdropFilter:
              "blur(6px)",

            padding: 16,
          }}
          onClick={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !submitting &&
              !creationResult
            ) {
              handleCloseModal();
            }
          }}
        >

          <div
            className="panel"
            style={{
              width:
                "100%",

              maxWidth:
                680,

              maxHeight:
                "92vh",

              overflowY:
                "auto",

              padding:
                28,
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "flex-start",

                marginBottom:
                  20,
              }}
            >

              <div>
                <h3
                  style={{
                    marginBottom:
                      4,
                  }}
                >
                  {editingAsset
                    ? `Edit Asset: ${editingAsset.name}`
                    : "Add New Asset"}
                </h3>

                <p
                  style={{
                    margin: 0,

                    fontSize: 12,

                    color:
                      "rgba(148,163,184,0.8)",
                  }}
                >
                  Enter factual
                  asset information.
                  Risk, Criticality
                  and Risk Level are
                  calculated
                  automatically.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={
                  handleCloseModal
                }
                disabled={
                  submitting
                }
              >
                <X size={20} />
              </button>

            </div>

            {/* RESULT */}

            {creationResult ? (
              <>
                <CreationResultBanner
                  result={
                    creationResult
                  }
                  assetName={
                    form.name
                  }
                  onDismiss={
                    handleCloseModal
                  }
                />

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "center",

                    gap: 10,

                    marginTop:
                      14,
                  }}
                >

                  <button
                    className="scan-button"
                    onClick={() => {
                      setCreationResult(
                        null
                      );

                      setForm({
                        ...EMPTY_FORM,
                      });
                    }}
                  >
                    <Plus size={14} />

                    Add Another
                  </button>

                  <button
                    className="scan-button"
                    onClick={
                      handleCloseModal
                    }
                  >
                    Close
                  </button>

                </div>
              </>
            ) : (

              <form
                onSubmit={
                  handleSaveAsset
                }
                style={{
                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap: 16,
                }}
              >

                {/* NAME */}
                {/* Correct dedicated Name input */}

                <div
                  style={{
                    display:
                      "none",
                  }}
                >
                  <input
                    value={
                      form.name
                    }
                    readOnly
                  />
                </div>

                {/* Actually render Name */}

                <div
                  style={{
                    marginTop:
                      -16,
                  }}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    ASSET NAME
                  </label>

                  <input
                    type="text"
                    value={
                      form.name
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          name:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="e.g. PROD-WEB-01"
                    style={
                      inputStyle
                    }
                    required
                  />
                </div>

                {/* TYPE / STATUS */}

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "1fr 1fr",

                    gap: 14,
                  }}
                >

                  <FormSelect
                    label="ASSET TYPE"
                    value={
                      form.asset_type
                    }
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          asset_type:
                            value,
                        })
                      )
                    }
                    options={[
                      {
                        value:
                          "server",
                        label:
                          "Server",
                      },
                      {
                        value:
                          "endpoint",
                        label:
                          "Endpoint",
                      },
                      {
                        value:
                          "cloud-resource",
                        label:
                          "Cloud Resource",
                      },
                      {
                        value:
                          "network-device",
                        label:
                          "Network Device",
                      },
                      {
                        value:
                          "database",
                        label:
                          "Database",
                      },
                      {
                        value:
                          "application",
                        label:
                          "Application",
                      },
                    ]}
                  />

                  <FormSelect
                    label="STATUS"
                    value={
                      form.status
                    }
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          status:
                            value,
                        })
                      )
                    }
                    options={[
                      {
                        value:
                          "Active",
                        label:
                          "Active",
                      },
                      {
                        value:
                          "Under Maintenance",
                        label:
                          "Under Maintenance",
                      },
                      {
                        value:
                          "Isolated",
                        label:
                          "Isolated",
                      },
                      {
                        value:
                          "Decommissioned",
                        label:
                          "Decommissioned",
                      },
                    ]}
                  />

                </div>

                {/* TECHNICAL DETAILS */}

                <div
                  style={{
                    borderTop:
                      "1px solid rgba(255,255,255,0.08)",

                    paddingTop:
                      16,
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        11,

                      fontWeight:
                        700,

                      letterSpacing:
                        "0.08em",

                      color:
                        "rgba(99,102,241,0.9)",

                      marginBottom:
                        10,
                    }}
                  >
                    {
                      form.asset_type.toUpperCase()
                    }{" "}
                    TECHNICAL DETAILS
                  </div>

                  <TypeSpecificFields
                    form={form}
                    setForm={
                      setForm
                    }
                  />

                </div>

                {/* RISK ATTRIBUTES */}

                <div
                  style={{
                    borderTop:
                      "1px solid rgba(255,255,255,0.08)",

                    paddingTop:
                      16,
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        11,

                      fontWeight:
                        700,

                      letterSpacing:
                        "0.08em",

                      color:
                        "rgba(99,102,241,0.9)",

                      marginBottom:
                        10,
                    }}
                  >
                    RISK ASSESSMENT ATTRIBUTES
                  </div>

                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "1fr 1fr",

                      gap: 14,
                    }}
                  >

                    <FormSelect
                      label="ENVIRONMENT"
                      value={
                        form.environment
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            environment:
                              value,
                          })
                        )
                      }
                      options={[
                        {
                          value:
                            "Production",
                          label:
                            "Production",
                        },
                        {
                          value:
                            "Staging",
                          label:
                            "Staging",
                        },
                        {
                          value:
                            "Development",
                          label:
                            "Development",
                        },
                        {
                          value:
                            "Sandbox",
                          label:
                            "Sandbox",
                        },
                      ]}
                    />

                    <FormSelect
                      label="BUSINESS IMPORTANCE"
                      value={
                        form.business_importance
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            business_importance:
                              value,
                          })
                        )
                      }
                      options={[
                        {
                          value:
                            "Critical",
                          label:
                            "Critical",
                        },
                        {
                          value:
                            "High",
                          label:
                            "High",
                        },
                        {
                          value:
                            "Medium",
                          label:
                            "Medium",
                        },
                        {
                          value:
                            "Low",
                          label:
                            "Low",
                        },
                      ]}
                    />

                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap: 10,

                      marginTop:
                        14,
                    }}
                  >

                    <ToggleField
                      label="Internet Exposed"
                      sublabel="Reachable from the public internet"
                      value={
                        form.internet_exposed
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            internet_exposed:
                              value,
                          })
                        )
                      }
                    />

                    <ToggleField
                      label="Contains Sensitive Data"
                      sublabel="PII, PCI, PHI, financial or regulated data"
                      value={
                        form.contains_sensitive_data
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            contains_sensitive_data:
                              value,
                          })
                        )
                      }
                    />

                  </div>
                </div>

                {/* LIVE PREVIEW */}

                <div
                  style={{
                    background:
                      "rgba(99,102,241,0.07)",

                    border:
                      "1px solid rgba(99,102,241,0.25)",

                    borderRadius: 8,

                    padding:
                      "12px 14px",
                  }}
                >

                  <div
                    style={{
                      fontSize:
                        10,

                      fontWeight:
                        700,

                      letterSpacing:
                        "0.08em",

                      color:
                        "rgba(99,102,241,0.9)",

                      marginBottom:
                        8,
                    }}
                  >
                    LIVE RISK PREVIEW
                  </div>

                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "1fr 1fr 1fr",

                      gap: 8,
                    }}
                  >

                    <ResultBox
                      label="Risk Score"
                      value={`${preview.score}/100`}
                    />

                    <ResultBox
                      label="Criticality"
                      value={
                        preview.criticality
                      }
                      color={
                        riskTextColor(
                          preview.criticality
                        )
                      }
                    />

                    <ResultBox
                      label="Risk Level"
                      value={
                        preview.riskLevel
                      }
                      color={
                        riskTextColor(
                          preview.riskLevel
                        )
                      }
                    />

                  </div>

                  <p
                    style={{
                      margin:
                        "8px 0 0",

                      fontSize:
                        10,

                      color:
                        "rgba(148,163,184,0.6)",
                    }}
                  >
                    Preview only. Final
                    values are always
                    calculated by the
                    backend.
                  </p>

                </div>

                {/* ACTIONS */}

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "flex-end",

                    gap: 10,

                    marginTop:
                      4,
                  }}
                >

                  <button
                    type="button"
                    className="scan-button"
                    onClick={
                      handleCloseModal
                    }
                    disabled={
                      submitting
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="scan-button"
                    disabled={
                      submitting ||
                      !form.name.trim()
                    }
                  >
                    {submitting
                      ? "Saving..."
                      : editingAsset
                        ? "Save & Recalculate Risk"
                        : "Add Asset & Calculate Risk"}
                  </button>

                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  icon,
  title,
  value,
  type,
}: {
  icon: React.ReactNode;

  title: string;

  value: number;

  type: string;
}) {
  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${type}`}
      >
        {icon}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-value">
        {value}
      </div>

    </div>
  );
}