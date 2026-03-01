import { NextResponse } from "next/server";
import { db, billingPlans } from "@/db/client";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(billingPlans)
      .orderBy(billingPlans.priceMonthlyCents);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/superadmin/plans error", err);
    return NextResponse.json(
      { error: "Failed to load plans" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const slug = (body.slug || "").trim();
    const priceMonthlyCents = Math.max(
      0,
      Math.round(Number(body.priceMonthlyCents ?? body.priceMonthly ?? 0)),
    );
    const priceYearlyCents = Math.max(
      0,
      Math.round(Number(body.priceYearlyCents ?? body.priceYearly ?? 0)),
    );
    const seats = body.seats !== undefined ? Number(body.seats) : null;
    const features = Array.isArray(body.features)
      ? body.features.map((f: unknown) => String(f))
      : [];

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing plan name or slug" },
        { status: 400 },
      );
    }

    // Ensure slug is unique by appending a numeric suffix when necessary
    const sanitize = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const baseSlug = sanitize(slug || name);
    let uniqueSlug = baseSlug;
    let suffix = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await db
        .select()
        .from(billingPlans)
        .where(eq(billingPlans.slug, uniqueSlug));
      if ((existing as any[]).length === 0) break;
      suffix += 1;
      uniqueSlug = `${baseSlug}-${suffix}`;
    }

    const [plan] = await db
      .insert(billingPlans)
      .values({
        name,
        slug: uniqueSlug,
        priceMonthlyCents,
        priceYearlyCents,
        seats: Number.isFinite(seats || undefined) ? seats : null,
        features,
      })
      .returning();

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("POST /api/superadmin/plans error", err);
    const msg = (err as any)?.message || "Failed to create plan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = (body.name || "").trim();
    if (body.slug !== undefined) patch.slug = (body.slug || "").trim();
    if (body.priceMonthlyCents !== undefined || body.priceMonthly !== undefined)
      patch.priceMonthlyCents = Math.max(
        0,
        Math.round(Number(body.priceMonthlyCents ?? body.priceMonthly ?? 0)),
      );
    if (body.priceYearlyCents !== undefined || body.priceYearly !== undefined)
      patch.priceYearlyCents = Math.max(
        0,
        Math.round(Number(body.priceYearlyCents ?? body.priceYearly ?? 0)),
      );
    if (body.seats !== undefined) patch.seats = Number(body.seats);
    if (body.features !== undefined)
      patch.features = Array.isArray(body.features)
        ? body.features.map((f: unknown) => String(f))
        : [];

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(billingPlans)
      .set(patch)
      .where(eq(billingPlans.id, id))
      .returning();

    return NextResponse.json({ success: true, plan: updated ?? null });
  } catch (err) {
    console.error("PATCH /api/superadmin/plans error", err);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(billingPlans).where(eq(billingPlans.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/superadmin/plans error", err);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 },
    );
  }
}
