import { collectionResponse, dataResponse, errorResponses, jsonBody, uuidParam } from "../helpers.js";

export const userPaths = {
  "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        description:
          "Returns platform users for administration screens. This endpoint is restricted to platform admins.",
        responses: { "200": collectionResponse("#/components/schemas/User") }
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        description:
          "Creates a platform user account. Tenant access is assigned separately through tenant memberships.",
        requestBody: jsonBody("#/components/schemas/CreateUser"),
        responses: {
          "201": dataResponse("#/components/schemas/User"),
          ...errorResponses
        }
      }
    },
  "/api/v1/users/{userId}": {
      get: {
        tags: ["Users"],
        summary: "Get user",
        description: "Returns a single platform user by id.",
        parameters: [uuidParam("userId")],
        responses: {
          "200": dataResponse("#/components/schemas/User"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Users"],
        summary: "Update user",
        description:
          "Updates mutable user profile and account status fields. Password changes are accepted when password is provided.",
        parameters: [uuidParam("userId")],
        requestBody: jsonBody("#/components/schemas/UpdateUser"),
        responses: {
          "200": dataResponse("#/components/schemas/User"),
          ...errorResponses
        }
      }
    }
} as const;
