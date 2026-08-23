import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const membershipPaths = {
  "/api/v1/tenants/{tenantId}/memberships": {
      get: {
        tags: ["Memberships"],
        summary: "List tenant memberships",
        description:
          "Lists users assigned to a tenant and their tenant roles. Platform admins bypass tenant membership checks.",
        parameters: [uuidParam("tenantId")],
        responses: {
          "200": collectionResponse("#/components/schemas/TenantMembership")
        }
      },
      post: {
        tags: ["Memberships"],
        summary: "Create tenant membership",
        description:
          "Assigns a user to a tenant with a tenant role. COMPANY_ADMIN access is required unless the caller is PLATFORM_ADMIN.",
        parameters: [uuidParam("tenantId")],
        requestBody: jsonBody("#/components/schemas/CreateTenantMembership"),
        responses: {
          "201": dataResponse("#/components/schemas/TenantMembership"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/memberships/{membershipId}": {
      patch: {
        tags: ["Memberships"],
        summary: "Update tenant membership",
        description:
          "Updates a tenant membership role or active status. The operation is audit logged with old and new values.",
        parameters: [uuidParam("tenantId"), uuidParam("membershipId")],
        requestBody: jsonBody("#/components/schemas/UpdateTenantMembership"),
        responses: {
          "200": dataResponse("#/components/schemas/TenantMembership"),
          ...errorResponses
        }
      }
    }
} as const;
