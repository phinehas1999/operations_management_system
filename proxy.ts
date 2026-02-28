import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";

function roleHome(role?: string | null, isSuperAdmin?: boolean) {
  if (isSuperAdmin) return "/superadmin";
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MANAGER":
      return "/manager";
    case "STAFF":
      return "/staff";
    default:
      return "/auth/login";
  }
}

export const proxy = auth((req: NextRequest & { auth?: any }) => {
  const session = req.auth;
  const role = session?.user?.role as string | undefined;
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
  const pathname = req.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/superadmin");

  // If not signed in and hitting a protected route, send to login
  if (!session && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (!session) return NextResponse.next();

  // Signed-in users should not see auth pages
  if (isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(role, isSuperAdmin);
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  // Enforce role access per area
  const toHome = () => {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(role, isSuperAdmin);
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/superadmin") && !isSuperAdmin) {
    return toHome();
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN" && !isSuperAdmin) return toHome();
  }

  if (pathname.startsWith("/manager")) {
    if (!(role === "MANAGER" || role === "ADMIN" || isSuperAdmin))
      return toHome();
  }

  if (pathname.startsWith("/staff")) {
    if (
      !(
        role === "STAFF" ||
        role === "MANAGER" ||
        role === "ADMIN" ||
        isSuperAdmin
      )
    )
      return toHome();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/auth/:path*",
    "/admin/:path*",
    "/manager/:path*",
    "/staff/:path*",
    "/superadmin/:path*",
  ],
};
