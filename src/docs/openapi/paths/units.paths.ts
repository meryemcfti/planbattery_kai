import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const unitPaths = {
  "/api/v1/units": {
      get: {
        tags: ["Units"],
        summary: "List units",
        description:
          "Returns measurement units used by activity records and emission factors. Units are global reference data.",
        responses: { "200": collectionResponse("#/components/schemas/Unit") }
      },
      post: {
        tags: ["Units"],
        summary: "Create unit",
        description:
          "Creates a global measurement unit such as m3 or kWh. Unit codes are unique and auditable.",
        requestBody: jsonBody("#/components/schemas/CreateUnit"),
        responses: {
          "201": dataResponse("#/components/schemas/Unit"),
          ...errorResponses
        }
      }
    },
  "/api/v1/units/{unitId}": {
      get: {
        tags: ["Units"],
        summary: "Get unit",
        description: "Returns one measurement unit by id.",
        parameters: [uuidParam("unitId")],
        responses: {
          "200": dataResponse("#/components/schemas/Unit"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Units"],
        summary: "Update unit",
        description:
          "Updates unit display metadata and active state without deleting historical references.",
        parameters: [uuidParam("unitId")],
        requestBody: jsonBody("#/components/schemas/UpdateUnit"),
        responses: {
          "200": dataResponse("#/components/schemas/Unit"),
          ...errorResponses
        }
      }
    }
} as const;
