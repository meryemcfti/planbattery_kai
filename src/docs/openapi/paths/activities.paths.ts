import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const activityPaths = {
  "/api/v1/tenants/{tenantId}/natural-gas-activities": {
      get: {
        tags: ["Activities"],
        summary: "List natural gas activities",
        description:
          "Lists natural gas consumption records for a tenant. Records include the assessment, facility, unit, and evidence metadata needed for review.",
        parameters: [uuidParam("tenantId")],
        responses: {
          "200": collectionResponse("#/components/schemas/NaturalGasActivity")
        }
      },
      post: {
        tags: ["Activities"],
        summary: "Create natural gas activity",
        description:
          "Creates a natural gas consumption activity for one tenant assessment and facility. The assessment and facility must both belong to the tenant.",
        parameters: [uuidParam("tenantId")],
        requestBody: jsonBody("#/components/schemas/CreateNaturalGasActivity"),
        responses: {
          "201": dataResponse("#/components/schemas/NaturalGasActivity"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/natural-gas-activities/{activityId}": {
      get: {
        tags: ["Activities"],
        summary: "Get natural gas activity",
        description:
          "Returns one natural gas activity with evidence and calculation results when available.",
        parameters: [uuidParam("tenantId"), uuidParam("activityId")],
        responses: {
          "200": dataResponse("#/components/schemas/NaturalGasActivity"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Activities"],
        summary: "Update natural gas activity",
        description:
          "Updates activity data before or during review. Changes are audit logged with old and new values.",
        parameters: [uuidParam("tenantId"), uuidParam("activityId")],
        requestBody: jsonBody("#/components/schemas/UpdateNaturalGasActivity"),
        responses: {
          "200": dataResponse("#/components/schemas/NaturalGasActivity"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/natural-gas-activities/{activityId}/validate": {
      post: {
        tags: ["Activities"],
        summary: "Validate natural gas activity",
        description:
          "Marks an activity as VALIDATED after review. Only validated activities can be used by the calculation engine.",
        parameters: [uuidParam("tenantId"), uuidParam("activityId")],
        requestBody: jsonBody("#/components/schemas/ValidateNaturalGasActivity"),
        responses: {
          "200": dataResponse("#/components/schemas/NaturalGasActivity"),
          ...errorResponses
        }
      }
    }
} as const;
