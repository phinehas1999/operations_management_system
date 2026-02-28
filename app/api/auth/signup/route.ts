import { NextResponse } from "next/server";
import { hash } from "argon2";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db, tenants, users } from "@/db/client";
import type { Role } from "@/db/schema";

const signupSchema = z.object({
  companyName: z.string().min(2).max(128),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "tenant"}-${suffix}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { companyName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const tenantSlug = slugify(companyName);
  const [tenant] = await db
    .insert(tenants)
    .values({ name: companyName, slug: tenantSlug, plan: "standard" })
    .returning();

  const passwordHash = await hash(password);

  const [user] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      name: companyName,
      password: passwordHash,
      role: "ADMIN" as Role,
      tenantId: tenant.id,
      isSuperAdmin: false,
    })
    .returning({ id: users.id });

  return NextResponse.json(
    { userId: user.id, tenantId: tenant.id, tenantSlug },
    { status: 201 },
  );
}
