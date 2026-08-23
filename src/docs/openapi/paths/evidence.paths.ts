import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const evidencePaths = {
  "/api/v1/tenants/{tenantId}/natural-gas-activities/{activityId}/evidence": {
    get: {
      tags: ["Evidence"],
      summary: "List activity evidence",
      description:
        "Lists evidence metadata attached to a natural gas activity. The API stores file references, not file bytes.",
      parameters: [uuidParam("tenantId"), uuidParam("activityId")],
      responses: {
        "200": collectionResponse("#/components/schemas/ActivityEvidence"),
        ...errorResponses
      }
    },
    post: {
      tags: ["Evidence"],
      summary: "Create activity evidence metadata",
      description:
        "Attaches invoice, meter, ERP, or other evidence metadata to an activity. storageKey identifies the external object storage location.",
      parameters: [uuidParam("tenantId"), uuidParam("activityId")],
      requestBody: jsonBody("#/components/schemas/CreateActivityEvidence"),
      responses: {
        "201": dataResponse("#/components/schemas/ActivityEvidence"),
        ...errorResponses
      }
    }
  }
} as const;
