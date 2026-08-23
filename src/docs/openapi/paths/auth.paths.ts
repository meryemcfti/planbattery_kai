import { dataResponse, errorResponses, jsonBody } from "../helpers.js";

export const authPaths = {
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login",
      description:
        "Authenticates an active user and returns a Bearer JWT. Use the token in the Authorization header for protected endpoints.",
      security: [],
      requestBody: jsonBody("#/components/schemas/LoginRequest"),
      responses: {
        "200": dataResponse("#/components/schemas/LoginResponse"),
        ...errorResponses
      }
    }
  }
} as const;
