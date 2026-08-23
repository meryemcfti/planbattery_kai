export const authSchemas = {
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", maxLength: 255 },
      password: { type: "string", minLength: 1, maxLength: 128 }
    }
  },
  LoginResponse: {
    type: "object",
    properties: {
      accessToken: { type: "string" },
      tokenType: { type: "string", example: "Bearer" },
      expiresIn: { type: "string", example: "1h" },
      user: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          email: { type: "string", format: "email" },
          fullName: { type: "string" },
          platformRole: { $ref: "#/components/schemas/PlatformRole" }
        }
      }
    },
    required: ["accessToken", "tokenType", "expiresIn", "user"]
  }
} as const;
