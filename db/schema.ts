import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "SUPERADMIN",
  "ADMIN",
  "MANAGER",
  "STAFF",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "Paid",
  "Due",
  "Overdue",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "Approved",
  "Rejected",
]);

export const statusEnum = pgEnum("tenant_status", ["Active", "Suspended"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  planId: uuid("plan_id")
    .references(() => billingPlans.id, { onDelete: "set null" })
    .$type<string | null>(),
  status: statusEnum("status").notNull().default("Active"),
  seats: integer("seats").notNull().default(1),
  adminEmail: text("admin_email"),
  monthlyRevenue: integer("monthly_revenue").notNull().default(0),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const billingPlans = pgTable("billing_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  priceMonthlyCents: integer("price_monthly_cents").notNull().default(0),
  priceYearlyCents: integer("price_yearly_cents").notNull().default(0),
  seats: integer("seats"),
  features: jsonb("features")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const invoices = pgTable("billing_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").references(() => billingPlans.id, {
    onDelete: "set null",
  }),
  planName: text("plan_name"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: invoiceStatusEnum("status").default("Due").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const paymentConfirmations = pgTable("payment_confirmations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, {
    onDelete: "set null",
  }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionReference: text("transaction_reference"),
  proofFileUrl: text("proof_file_url"),
  status: paymentStatusEnum("status").default("Pending").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  password: text("password"),
  role: roleEnum("role").notNull().default("STAFF"),
  tenantId: uuid("tenant_id").references(() => tenants.id, {
    onDelete: "set null",
  }),
  isSuperAdmin: boolean("is_superadmin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const billingPlansRelations = relations(billingPlans, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.id],
  }),
  plan: one(billingPlans, {
    fields: [invoices.planId],
    references: [billingPlans.id],
  }),
  payments: many(paymentConfirmations),
}));

export const paymentConfirmationsRelations = relations(
  paymentConfirmations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [paymentConfirmations.tenantId],
      references: [tenants.id],
    }),
    invoice: one(invoices, {
      fields: [paymentConfirmations.invoiceId],
      references: [invoices.id],
    }),
  }),
);

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  users: many(users),
  plan: one(billingPlans, {
    fields: [tenants.planId],
    references: [billingPlans.id],
  }),
  payments: many(paymentConfirmations),
}));

// NextAuth adapter tables
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    pk: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export type Role = (typeof roleEnum.enumValues)[number];
export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type BillingPlan = typeof billingPlans.$inferSelect;
export type Plan = BillingPlan;
export type TenantStatus = (typeof statusEnum.enumValues)[number];
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
export type PaymentConfirmation = typeof paymentConfirmations.$inferSelect;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
