import type { platform_role, tenant_role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      authUser?: {
        id: string;
        email: string;
        platformRole: platform_role;
      };
      tenantMembership?: {
        id: string;
        tenantId: string;
        role: tenant_role;
      };
    }
  }
}

export {};
