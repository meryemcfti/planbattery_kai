import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const assessmentPaths = {
  "/api/v1/tenants/{tenantId}/assessments": {
      get: {
        tags: ["Assessments"],
        summary: "List assessments",
        description:
          "Lists carbon assessment periods for a tenant, including attached facilities.",
        parameters: [uuidParam("tenantId")],
        responses: {
          "200": collectionResponse("#/components/schemas/Assessment")
        }
      },
      post: {
        tags: ["Assessments"],
        summary: "Create assessment",
        description:
          "Creates a tenant assessment period and optionally attaches facilities. The assessment becomes the container for activity data, calculations, and report records.",
        parameters: [uuidParam("tenantId")],
        requestBody: jsonBody("#/components/schemas/CreateAssessment"),
        responses: {
          "201": dataResponse("#/components/schemas/Assessment"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/assessments/{assessmentId}": {
      get: {
        tags: ["Assessments"],
        summary: "Get assessment",
        description:
          "Returns an assessment with its attached facilities and activity records.",
        parameters: [uuidParam("tenantId"), uuidParam("assessmentId")],
        responses: {
          "200": dataResponse("#/components/schemas/Assessment"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Assessments"],
        summary: "Update assessment",
        description:
          "Updates assessment fields or status. Setting status to FINALIZED records finalized_at and writes a FINALIZE audit action.",
        parameters: [uuidParam("tenantId"), uuidParam("assessmentId")],
        requestBody: jsonBody("#/components/schemas/UpdateAssessment"),
        responses: {
          "200": dataResponse("#/components/schemas/Assessment"),
          ...errorResponses
        }
      }
    }
} as const;
