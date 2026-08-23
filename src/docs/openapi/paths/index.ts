import { authPaths } from "./auth.paths.js";
import { auditPaths } from "./audit.paths.js";
import { systemPaths } from "./system.paths.js";
import { userPaths } from "./users.paths.js";
import { tenantPaths } from "./tenants.paths.js";
import { membershipPaths } from "./memberships.paths.js";
import { unitPaths } from "./units.paths.js";
import { facilityPaths } from "./facilities.paths.js";
import { assessmentPaths } from "./assessments.paths.js";
import { activityPaths } from "./activities.paths.js";
import { emissionFactorPaths } from "./emission-factors.paths.js";
import { gwpSetPaths } from "./gwp-sets.paths.js";
import { calculationPaths } from "./calculations.paths.js";
import { evidencePaths } from "./evidence.paths.js";
import { reportPaths } from "./reports.paths.js";

export const paths = {
  ...systemPaths,
  ...authPaths,
  ...userPaths,
  ...tenantPaths,
  ...membershipPaths,
  ...unitPaths,
  ...facilityPaths,
  ...assessmentPaths,
  ...activityPaths,
  ...evidencePaths,
  ...reportPaths,
  ...emissionFactorPaths,
  ...gwpSetPaths,
  ...calculationPaths,
  ...auditPaths
} as const;
