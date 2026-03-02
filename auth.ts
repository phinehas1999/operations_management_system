import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { verify } from "argon2";

import { db, users } from "@/db/client";
import type { Role } from "@/db/schema";

const authConfig = {
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase()
            : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;

        if (!email || !password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
          with: { tenant: true },
        });

        if (!user || !user.password) return null;

        // Only allow sign-in for active tenant members (superadmins bypass tenant checks)
        if (!user.isSuperAdmin) {
          if (!user.tenant || user.tenant.status !== "Active") {
            return null;
          }
        }

        const valid = await verify(user.password, password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          tenantId: user.tenantId,
          isSuperAdmin: user.isSuperAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role | undefined;
        session.user.tenantId = token.tenantId as string | null | undefined;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative or same-origin URLs; otherwise, stay on baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      const allowed = new URL(url);
      if (allowed.origin === baseUrl) return url;
      return baseUrl;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
