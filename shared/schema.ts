import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("expense"), // 'income' or 'expense'
  monthlyLimit: numeric("monthly_limit").notNull().default("0"),
  color: text("color").default("#4ade80"), // Neon green default
  icon: text("icon").default("circle"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(), // Foreign key relation would be here in a real DB
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  note: text("note"),
  type: text("type").notNull().default("expense"), // 'income' or 'expense'
});

// === BASE SCHEMAS ===
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Request types
export type CreateCategoryRequest = InsertCategory;
export type UpdateCategoryRequest = Partial<InsertCategory>;

export type CreateTransactionRequest = InsertTransaction;
export type UpdateTransactionRequest = Partial<InsertTransaction>;

// Response types
export type CategoryResponse = Category;
export type TransactionResponse = Transaction;
