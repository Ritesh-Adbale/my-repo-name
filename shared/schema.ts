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

// === CURRENCY TYPES ===
export const SUPPORTED_CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupees' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollars' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euros' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pounds' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export interface CurrencyPreference {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export type GetCurrencyResponse = CurrencyPreference;
export type SetCurrencyRequest = { code: CurrencyCode };

// === MONTHLY BUDGET TYPES ===
export interface MonthlyBudget {
  yearMonth: string; // Format: "2024-03"
  limit: number;
}

export type GetMonthlyBudgetRequest = { yearMonth: string };
export type SetMonthlyBudgetRequest = { yearMonth: string; limit: number };
export type GetMonthlyBudgetResponse = MonthlyBudget;
