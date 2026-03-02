import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import { db, tenants } from "@/db/client";
import type { Tenant } from "@/db/schema";

type TenantSessionResult =
  | { ok: true; session: Session; tenant: Tenant | null }
  | {
      ok: false;
      session: Session | null;
      tenant: Tenant | null;
      status: number;
      reason: "unauthenticated" | "tenant_required" | "tenant_inactive";
    };

export async function getTenantSession({
  allowSuperAdmin = false,
}: { allowSuperAdmin?: boolean } = {}): Promise<TenantSessionResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      session: null,
      tenant: null,
      status: 401,
      reason: "unauthenticated",
    };
  }

  if (session.user.isSuperAdmin && allowSuperAdmin) {
    return { ok: true, session, tenant: null };
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) {
    return {
      ok: false,
      session,
      tenant: null,
      status: 403,
      reason: "tenant_required",
    };
  }

  const tenantFound = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  const tenant = tenantFound ?? null; // normalize undefined -> null for consistent typing

  if (!tenant || tenant.status !== "Active") {
    return {
      ok: false,
      session,
      tenant,
      status: 403,
      reason: "tenant_inactive",
    };
  }

  return { ok: true, session, tenant };
}

export async function requireActiveTenant(opts?: {
  allowSuperAdmin?: false;
  redirectTo?: string;
}): Promise<{ session: Session; tenant: Tenant }>;
export async function requireActiveTenant(opts: {
  allowSuperAdmin: true;
  redirectTo?: string;
}): Promise<{ session: Session; tenant: Tenant | null }>;
export async function requireActiveTenant({
  allowSuperAdmin = false,
  redirectTo = "/auth/login",
}: {
  allowSuperAdmin?: boolean;
  redirectTo?: string;
} = {}) {
  const result = await getTenantSession({ allowSuperAdmin });
  if (!result.ok) {
    redirect(redirectTo);
  }

  // If superadmin access allowed, tenant may be null for superadmins
  if (allowSuperAdmin) {
    return { session: result.session!, tenant: result.tenant };
  }

  // For the default case (allowSuperAdmin=false) ensure tenant is present
  if (!result.tenant) {
    redirect(redirectTo);
  }

  return { session: result.session!, tenant: result.tenant! };
}

export async function requireTenantApi({
  allowSuperAdmin = false,
}: { allowSuperAdmin?: boolean } = {}) {
  const result = await getTenantSession({ allowSuperAdmin });
  if (!result.ok) {
    return {
      session: null,
      tenant: null,
      response: NextResponse.json(
        { error: result.reason },
        { status: result.status },
      ),
    };
  }

  return { session: result.session, tenant: result.tenant, response: null };
}
