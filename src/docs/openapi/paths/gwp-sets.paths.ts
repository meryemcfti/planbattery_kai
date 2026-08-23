import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const gwpSetPaths = {
  "/api/v1/gwp-sets": {
      get: {
        tags: ["GWP Sets"],
        summary: "List GWP sets",
        description:
          "Lists GWP sets and gas values used to convert gas mass into CO2e.",
        responses: {
          "200": collectionResponse("#/components/schemas/GwpSet")
        }
      },
      post: {
        tags: ["GWP Sets"],
        summary: "Create GWP set",
        description:
          "Creates a GWP set with gas values. Natural gas calculations require at least a CO2 GWP value.",
        requestBody: jsonBody("#/components/schemas/CreateGwpSet"),
        responses: {
          "201": dataResponse("#/components/schemas/GwpSet"),
          ...errorResponses
        }
      }
    },
  "/api/v1/gwp-sets/{gwpSetId}/status": {
      patch: {
        tags: ["GWP Sets"],
        summary: "Set GWP set active status",
        description:
          "Activates or deactivates a GWP set. The update is audit logged with old and new values.",
        parameters: [uuidParam("gwpSetId")],
        requestBody: jsonBody("#/components/schemas/SetActiveStatus"),
        responses: {
          "200": dataResponse("#/components/schemas/GwpSet"),
          ...errorResponses
        }
      }
    }
} as const;
