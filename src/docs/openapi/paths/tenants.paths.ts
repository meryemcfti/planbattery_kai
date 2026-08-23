import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const tenantPaths = {
  "/api/v1/tenants": {
      get: {
        tags: ["Tenants"],
        summary: "List tenants",
        description:
          "Returns all tenants. This endpoint is intended for platform administration and requires PLATFORM_ADMIN access.",
        responses: { "200": collectionResponse("#/components/schemas/Tenant") }
      },
      post: {
        tags: ["Tenants"],
        summary: "Create tenant",
        description:
          "Creates a company tenant. Tenant data is the root boundary for facilities, memberships, assessments, activity data, reports, and audit logs.",
        requestBody: jsonBody("#/components/schemas/CreateTenant"),
        responses: {
          "201": dataResponse("#/components/schemas/Tenant"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}": {
      get: {
        tags: ["Tenants"],
        summary: "Get tenant",
        description:
          "Returns one tenant by id. Platform admin access is required.",
        parameters: [uuidParam("tenantId")],
        responses: {
          "200": dataResponse("#/components/schemas/Tenant"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Tenants"],
        summary: "Update tenant",
        description:
          "Updates tenant profile fields or active status. The operation is audit logged with old and new values.",
        parameters: [uuidParam("tenantId")],
        requestBody: jsonBody("#/components/schemas/UpdateTenant"),
        responses: {
          "200": dataResponse("#/components/schemas/Tenant"),
          ...errorResponses
        }
      }
    }
} as const;
