import { auditSchemas } from "./schemas/audit.schemas.js";
import { authSchemas } from "./schemas/auth.schemas.js";
import { commonSchemas } from "./schemas/common.schemas.js";
import { userSchemas } from "./schemas/users.schemas.js";
import { tenantSchemas } from "./schemas/tenants.schemas.js";
import { membershipSchemas } from "./schemas/memberships.schemas.js";
import { unitSchemas } from "./schemas/units.schemas.js";
import { facilitySchemas } from "./schemas/facilities.schemas.js";
import { assessmentSchemas } from "./schemas/assessments.schemas.js";
import { activitySchemas } from "./schemas/activities.schemas.js";
import { emissionFactorSchemas } from "./schemas/emission-factors.schemas.js";
import { gwpSetSchemas } from "./schemas/gwp-sets.schemas.js";
import { calculationSchemas } from "./schemas/calculations.schemas.js";
import { evidenceSchemas } from "./schemas/evidence.schemas.js";
import { reportSchemas } from "./schemas/reports.schemas.js";
import { responses } from "./responses.js";

export const components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT"
    }
  },
  responses,
  schemas: {
    ...authSchemas,
    ...commonSchemas,
    ...userSchemas,
    ...tenantSchemas,
    ...membershipSchemas,
    ...unitSchemas,
    ...facilitySchemas,
    ...assessmentSchemas,
    ...activitySchemas,
    ...evidenceSchemas,
    ...reportSchemas,
    ...emissionFactorSchemas,
    ...gwpSetSchemas,
    ...calculationSchemas,
    ...auditSchemas
  }
} as const;
