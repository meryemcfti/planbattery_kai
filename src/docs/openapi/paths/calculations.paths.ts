import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const calculationPaths = {
  "/api/v1/tenants/{tenantId}/calculations": {
      get: {
        tags: ["Calculations"],
        summary: "List calculation runs",
        description:
          "Lists calculation runs for a tenant, including input snapshots, factor snapshots, and results.",
        parameters: [uuidParam("tenantId")],
        responses: {
          "200": collectionResponse("#/components/schemas/CalculationRun")
        }
      },
      post: {
        tags: ["Calculations"],
        summary: "Create calculation run",
        description:
          "Runs the natural gas CO2e calculation for a validated activity. The engine freezes activity inputs, emission factor values, and GWP values into snapshots before storing results.",
        parameters: [uuidParam("tenantId")],
        requestBody: jsonBody("#/components/schemas/CreateCalculationRun"),
        responses: {
          "201": dataResponse("#/components/schemas/CalculationRun"),
          ...errorResponses
        }
      }
    },
  "/api/v1/tenants/{tenantId}/calculations/{calculationRunId}": {
      get: {
        tags: ["Calculations"],
        summary: "Get calculation run",
        description:
          "Returns one calculation run with source factor data, GWP data, snapshots, and result records.",
        parameters: [uuidParam("tenantId"), uuidParam("calculationRunId")],
        responses: {
          "200": dataResponse("#/components/schemas/CalculationRun"),
          ...errorResponses
        }
      }
    }
} as const;
