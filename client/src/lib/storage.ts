import { 
  type Category, 
  type Transaction, 
  type InsertCategory, 
  type InsertTransaction,
  type UpdateCategoryRequest,
  type UpdateTransactionRequest
} from "@shared/schema";

// LocalStorage Keys
const KEYS = {
  CATEGORIES: 'budget_app_categories',
  TRANSACTIONS: 'budget_app_transactions',
  CURRENCY: 'budget_app_currency',
  MONTHLY_BUDGETS: 'budget_app_monthly_budgets',
  INIT: 'budget_app_initialized'
};

// Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Groceries", type: "expense", monthlyLimit: "500", color: "#4ade80", icon: "shopping-cart" },
  { id: 2, name: "Rent", type: "expense", monthlyLimit: "1500", color: "#f87171", icon: "home" },
  { id: 3, name: "Salary", type: "income", monthlyLimit: "0", color: "#60a5fa", icon: "briefcase" },
  { id: 4, name: "Entertainment", type: "expense", monthlyLimit: "200", color: "#c084fc", icon: "film" },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 1, categoryId: 3, amount: "4000", date: new Date("2024-03-01"), note: "March Salary", type: "income" },
  { id: 2, categoryId: 2, amount: "1500", date: new Date("2024-03-02"), note: "March Rent", type: "expense" },
  { id: 3, categoryId: 1, amount: "120.50", date: new Date("2024-03-05"), note: "Weekly groceries", type: "expense" },
];

class LocalStorageDB {
  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem(KEYS.INIT)) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      // Serialize dates properly for storage
      const serializedTransactions = DEFAULT_TRANSACTIONS.map(t => ({
        ...t,
        date: t.date.toISOString()
      }));
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(serializedTransactions));
      localStorage.setItem(KEYS.CURRENCY, 'INR');
      // Default monthly budget: 30,000
      const defaultBudgets = {
        '2024-03': 30000,
      };
      localStorage.setItem(KEYS.MONTHLY_BUDGETS, JSON.stringify(defaultBudgets));
      localStorage.setItem(KEYS.INIT, 'true');
    }
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const categories = await this.getCategories();
    const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
    const newCategory: Category = { ...data, id: newId, monthlyLimit: data.monthlyLimit || "0", color: data.color || "#4ade80", icon: data.icon || "circle" };
    
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify([...categories, newCategory]));
    return newCategory;
  }

  async updateCategory(id: number, updates: UpdateCategoryRequest): Promise<Category> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    
    const updated = { ...categories[index], ...updates };
    categories[index] = updated;
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(filtered));
  }

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) return [];
    
    return JSON.parse(data).map((t: any) => ({
      ...t,
      date: new Date(t.date) // Hydrate dates
    }));
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const transactions = await this.getTransactions();
    const newId = Math.max(0, ...transactions.map(t => t.id)) + 1;
    const newTransaction: Transaction = { 
      ...data, 
      id: newId,
      date: data.date ? new Date(data.date) : new Date(), // Ensure date object
      note: data.note || null
    };
    
    // Serialize for storage
    const toStore = [...transactions, newTransaction].map(t => ({
      ...t,
      date: t.date.toISOString()
    }));
    
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(toStore));
    return newTransaction;
  }

  async updateTransaction(id: number, updates: UpdateTransactionRequest): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Transaction not found");
    
    const updated = { ...transactions[index], ...updates };
    if (updates.date) updated.date = new Date(updates.date);
    
    transactions[index] = updated;
    
    const toStore = transactions.map(t => ({
      ...t,
      date: t.date.toISOString()
    }));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(toStore));
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    
    const toStore = filtered.map(t => ({
      ...t,
      date: t.date.toISOString()
    }));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(toStore));
  }

  // --- Monthly Budgets ---
  async getMonthlyBudget(yearMonth: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(KEYS.MONTHLY_BUDGETS);
    if (!data) return 30000; // Default budget
    const budgets = JSON.parse(data);
    return budgets[yearMonth] || 30000;
  }

  async setMonthlyBudget(yearMonth: string, limit: number): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(KEYS.MONTHLY_BUDGETS);
    const budgets = data ? JSON.parse(data) : {};
    budgets[yearMonth] = limit;
    localStorage.setItem(KEYS.MONTHLY_BUDGETS, JSON.stringify(budgets));
    return limit;
  }
}

export const db = new LocalStorageDB();

// Currency utilities
export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupees' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollars' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euros' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pounds' },
};

export function getCurrency(): string {
  if (typeof window === 'undefined') return 'INR';
  return localStorage.getItem(KEYS.CURRENCY) || 'INR';
}

export function setCurrency(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.CURRENCY, code);
}

export function formatAmount(amount: number, currencyCode?: string): string {
  const code = currencyCode || getCurrency();
  const currency = CURRENCIES[code as keyof typeof CURRENCIES];
  return `${currency.symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function getMonthlyBudget(yearMonth: string): Promise<number> {
  return db.getMonthlyBudget(yearMonth);
}

export async function setMonthlyBudget(yearMonth: string, limit: number): Promise<number> {
  return db.setMonthlyBudget(yearMonth, limit);
}
