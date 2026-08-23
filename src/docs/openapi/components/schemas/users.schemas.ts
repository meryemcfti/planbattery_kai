export const userSchemas = {
  User: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          email: { type: "string", format: "email" },
          full_name: { type: "string" },
          platform_role: { $ref: "#/components/schemas/PlatformRole" },
          is_active: { type: "boolean" },
          last_login_at: { $ref: "#/components/schemas/Timestamp" },
          created_at: { $ref: "#/components/schemas/Timestamp" },
          updated_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateUser: {
        type: "object",
        required: ["email", "password", "fullName"],
        properties: {
          email: { type: "string", format: "email", maxLength: 255 },
          password: { type: "string", minLength: 8, maxLength: 128 },
          fullName: { type: "string", minLength: 1, maxLength: 150 },
          platformRole: { $ref: "#/components/schemas/PlatformRole" }
        }
      },
  UpdateUser: {
        type: "object",
        properties: {
          fullName: { type: "string", minLength: 1, maxLength: 150 },
          platformRole: { $ref: "#/components/schemas/PlatformRole" },
          isActive: { type: "boolean" }
        }
      },
  PlatformRole: {
        type: "string",
        enum: ["USER", "PLATFORM_ADMIN"]
      }
} as const;
