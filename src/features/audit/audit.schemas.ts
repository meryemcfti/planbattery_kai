import { z } from "zod";

export const auditParamsSchema = z.object({
  tenantId: z.string().uuid()
});
