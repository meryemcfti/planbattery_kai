import { Router } from "express";

import { assessmentRouter } from "../features/assessments/assessment.routes.js";
import { authRouter } from "../features/auth/auth.routes.js";
import { auditRouter } from "../features/audit/audit.routes.js";
import { calculationRouter } from "../features/calculations/calculation.routes.js";
import { activityEvidenceRouter } from "../features/activity-evidence/activity-evidence.routes.js";
import { emissionFactorRouter } from "../features/emission-factors/emission-factor.routes.js";
import { facilityRouter } from "../features/facilities/facility.routes.js";
import { gwpSetRouter } from "../features/gwp-sets/gwp-set.routes.js";
import { naturalGasActivityRouter } from "../features/natural-gas-activities/natural-gas-activity.routes.js";
import { reportRouter } from "../features/reports/report.routes.js";
import { tenantMembershipRouter } from "../features/tenant-memberships/tenant-membership.routes.js";
import { tenantRouter } from "../features/tenants/tenant.routes.js";
import { unitRouter } from "../features/units/unit.routes.js";
import { userRouter } from "../features/users/user.routes.js";
import { requireAuth, requirePlatformAdmin } from "../middlewares/auth.js";

export const apiRouter = Router();

apiRouter.get("/status", (_req, res) => {
  res.status(200).json({
    service: "kai-backend",
    status: "running"
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use(requireAuth);

apiRouter.use("/tenants", tenantRouter);
apiRouter.use("/users", requirePlatformAdmin, userRouter);
apiRouter.use("/units", requirePlatformAdmin, unitRouter);
apiRouter.use("/emission-factors", requirePlatformAdmin, emissionFactorRouter);
apiRouter.use("/gwp-sets", requirePlatformAdmin, gwpSetRouter);
apiRouter.use("/tenants/:tenantId/facilities", facilityRouter);
apiRouter.use("/tenants/:tenantId/memberships", tenantMembershipRouter);
apiRouter.use("/tenants/:tenantId/assessments", assessmentRouter);
apiRouter.use(
  "/tenants/:tenantId/natural-gas-activities",
  naturalGasActivityRouter
);
apiRouter.use(
  "/tenants/:tenantId/natural-gas-activities/:activityId/evidence",
  activityEvidenceRouter
);
apiRouter.use(
  "/tenants/:tenantId/assessments/:assessmentId/reports",
  reportRouter
);
apiRouter.use("/tenants/:tenantId/calculations", calculationRouter);
apiRouter.use("/tenants/:tenantId/audit-logs", auditRouter);
