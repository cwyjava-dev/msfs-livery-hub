import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Liveries table - stores MSFS livery information
 */
export const liveries = mysqlTable("liveries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  manufacturer: mysqlEnum("manufacturer", ["Airbus", "Boeing"]).notNull(),
  aircraft: varchar("aircraft", { length: 64 }).notNull(), // e.g., "A320", "B737"
  brand: varchar("brand", { length: 128 }).notNull(), // e.g., "FBW", "PMDG", or custom
  liveryName: varchar("liveryName", { length: 256 }).notNull(),
  description: text("description"),
  msfsVersion: mysqlEnum("msfsVersion", ["2020", "2024", "Both"]),
  installMethod: text("installMethod"), // Installation instructions
  // Screenshots stored as JSON array of S3 URLs
  screenshots: text("screenshots"), // JSON string: ["url1", "url2", ...]
  // Livery file stored in S3
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileName: varchar("fileName", { length: 256 }),
  fileSize: int("fileSize"), // in bytes
  downloadCount: int("downloadCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Livery = typeof liveries.$inferSelect;
export type InsertLivery = typeof liveries.$inferInsert;

/**
 * Contact/Report table - stores user inquiries and reports
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["general", "upload_error", "copyright", "feature_request"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  // Optional: related livery information (for reports)
  relatedLiveryId: int("relatedLiveryId"),
  relatedLiveryInfo: text("relatedLiveryInfo"), // JSON string with livery details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
