import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const emissionFactorPaths = {
  "/api/v1/emission-factors/sources": {
      get: {
        tags: ["Emission Factors"],
        summary: "List emission factor sources",
        description:
          "Lists reference sources for emission factors, such as publisher, year, version, URL, and validity period.",
        responses: {
          "200": collectionResponse("#/components/schemas/EmissionFactorSource")
        }
      },
      post: {
        tags: ["Emission Factors"],
        summary: "Create emission factor source",
        description:
          "Creates a reference source that can be linked to one or more emission factors.",
        requestBody: jsonBody("#/components/schemas/CreateEmissionFactorSource"),
        responses: {
          "201": dataResponse("#/components/schemas/EmissionFactorSource"),
          ...errorResponses
        }
      }
    },
  "/api/v1/emission-factors": {
      get: {
        tags: ["Emission Factors"],
        summary: "List emission factors",
        description:
          "Lists active and inactive emission factors with source, input unit, and gas component values.",
        responses: {
          "200": collectionResponse("#/components/schemas/EmissionFactor")
        }
      },
      post: {
        tags: ["Emission Factors"],
        summary: "Create emission factor",
        description:
          "Creates an emission factor and its gas components. Natural gas calculations require a SCOPE_1 STATIONARY_COMBUSTION factor with a CO2 component.",
        requestBody: jsonBody("#/components/schemas/CreateEmissionFactor"),
        responses: {
          "201": dataResponse("#/components/schemas/EmissionFactor"),
          ...errorResponses
        }
      }
    },
  "/api/v1/emission-factors/{factorId}/status": {
      patch: {
        tags: ["Emission Factors"],
        summary: "Set emission factor active status",
        description:
          "Activates or deactivates an emission factor. The update is audit logged with old and new factor state.",
        parameters: [uuidParam("factorId")],
        requestBody: jsonBody("#/components/schemas/SetActiveStatus"),
        responses: {
          "200": dataResponse("#/components/schemas/EmissionFactor"),
          ...errorResponses
        }
      }
    }
} as const;
