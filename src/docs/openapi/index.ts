import { components } from "./components.js";
import { paths } from "./paths/index.js";

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Kai Backend API",
    version: "0.1.0",
    description:
      "Kai Backend API manages tenant-scoped carbon assessments for natural gas Scope 1 emissions. The API captures activity data, evidence metadata, emission factors, GWP sets, calculation snapshots, report records, and audit trails so every reported value can be traced back to its source inputs and calculation context."
  },
  servers: [
    {
      url: "http://localhost:3000"
    }
  ],
  tags: [
    {
      name: "Auth",
      description: "JWT login and session bootstrap."
    },
    {
      name: "System",
      description: "Health and API status endpoints."
    },
    {
      name: "Users",
      description: "Platform users. Platform admin access is required."
    },
    {
      name: "Tenants",
      description: "Company accounts that isolate facilities, assessments, activities, reports, and audit logs."
    },
    {
      name: "Memberships",
      description: "Tenant user assignments and tenant roles: COMPANY_ADMIN, DATA_ENTRY, VIEWER."
    },
    {
      name: "Units",
      description: "Measurement units used by activities and emission factors."
    },
    {
      name: "Facilities",
      description: "Tenant-owned operational sites included in carbon assessments."
    },
    {
      name: "Assessments",
      description: "Reporting periods that group facilities, activities, calculations, and report records."
    },
    {
      name: "Activities",
      description: "Natural gas consumption records entered for a tenant assessment and facility."
    },
    {
      name: "Evidence",
      description: "Evidence metadata linked to activity records. File storage is represented by storageKey."
    },
    {
      name: "Reports",
      description: "Versioned report records for finalized assessments."
    },
    {
      name: "Emission Factors",
      description: "Emission factor sources, factors, and gas components used by the calculation engine."
    },
    {
      name: "GWP Sets",
      description: "Global warming potential sets used to convert gas mass into CO2e."
    },
    {
      name: "Calculations",
      description: "Natural gas CO2e calculation runs with input, factor, and result snapshots."
    },
    {
      name: "Audit",
      description: "Immutable tenant-scoped records of create, update, calculate, finalize, and export actions."
    }
  ],
  security: [{ bearerAuth: [] }],
  paths,
  components
} as const;
