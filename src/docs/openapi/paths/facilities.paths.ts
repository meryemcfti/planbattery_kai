import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const facilityPaths = {
  "/api/v1/tenants/{tenantId}/facilities": {
      get: {
        tags: ["Facilities"],
        summary: "List facilities",
        description:
          "Lists tenant-owned facilities that can be attached to assessment periods.",
        parameters: [uuidParam("tenantId")],
        responses: {
          "200": collectionResponse("#/components/schemas/Facility")
        }
      },
      post: {
        tags: ["Facilities"],
        summary: "Create facility",
        description:
          "Creates a tenant facility. Facilities provide site context for activity data and calculation snapshots.",
        parameters: [uuidParam("tenantId")],
        requestBody: jsonBody("#/components/schemas/CreateFacility"),
        responses: {
          "201": dataResponse("#/components/schemas/Facility"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/facilities/{facilityId}": {
      get: {
        tags: ["Facilities"],
        summary: "Get facility",
        description:
          "Returns a facility only if it belongs to the requested tenant.",
        parameters: [uuidParam("tenantId"), uuidParam("facilityId")],
        responses: {
          "200": dataResponse("#/components/schemas/Facility"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Facilities"],
        summary: "Update facility",
        description:
          "Updates facility metadata or active status. The operation is audit logged with old and new values.",
        parameters: [uuidParam("tenantId"), uuidParam("facilityId")],
        requestBody: jsonBody("#/components/schemas/UpdateFacility"),
        responses: {
          "200": dataResponse("#/components/schemas/Facility"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/assessments/{assessmentId}/facilities": {
      post: {
        tags: ["Assessments"],
        summary: "Attach facilities to assessment",
        description:
          "Adds tenant facilities to an assessment. The operation rejects facilities outside the tenant boundary and records old and new facility attachments in audit logs.",
        parameters: [uuidParam("tenantId"), uuidParam("assessmentId")],
        requestBody: jsonBody("#/components/schemas/AttachFacilities"),
        responses: {
          "200": dataResponse("#/components/schemas/Assessment"),
          ...errorResponses
        }
      }
    }
} as const;
