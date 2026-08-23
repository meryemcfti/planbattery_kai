import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const reportPaths = {
  "/api/v1/tenants/{tenantId}/assessments/{assessmentId}/reports": {
    get: {
      tags: ["Reports"],
      summary: "List assessment reports",
      description:
        "Lists versioned report records for a finalized assessment.",
      parameters: [uuidParam("tenantId"), uuidParam("assessmentId")],
      responses: {
        "200": collectionResponse("#/components/schemas/Report"),
        ...errorResponses
      }
    },
    post: {
      tags: ["Reports"],
      summary: "Create assessment report record",
      description:
        "Creates the next report version for a finalized assessment. If fileName and storageKey are provided, the report is marked READY; otherwise it starts as GENERATING.",
      parameters: [uuidParam("tenantId"), uuidParam("assessmentId")],
      requestBody: jsonBody("#/components/schemas/CreateReport"),
      responses: {
        "201": dataResponse("#/components/schemas/Report"),
        ...errorResponses
      }
    }
  }
} as const;
