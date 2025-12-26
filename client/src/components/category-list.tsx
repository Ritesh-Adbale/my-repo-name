import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ArrowRight, ShoppingCart, Home, Briefcase, Film, Coffee, Car, Heart, Zap, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { Link } from "wouter";

const ICON_MAP: Record<string, any> = {
  "shopping-cart": ShoppingCart,
  "home": Home,
  "briefcase": Briefcase,
  "film": Film,
  "coffee": Coffee,
  "car": Car,
  "heart": Heart,
  "zap": Zap,
  "circle": AlertCircle,
};

export function CategoryList() {
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: transactions, isLoading: transLoading } = useTransactions();

  if (catsLoading || transLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  // Filter for expense categories only for the budget view
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];
  
  // Calculate spending per category for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const getSpending = (categoryId: number) => {
    return transactions
      ?.filter(t => {
        const d = new Date(t.date);
        return t.categoryId === categoryId && 
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear &&
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Categories</h3>
        <Link href="/insights" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          View Analysis
        </Link>
      </div>

      <div className="grid gap-3">
        {expenseCategories.map(cat => {
          const spent = getSpending(cat.id);
          const limit = Number(cat.monthlyLimit);
          const percent = Math.min((spent / limit) * 100, 100);
          const Icon = ICON_MAP[cat.icon || 'circle'] || AlertCircle;
          const isOverBudget = spent > limit;

          return (
            <div key={cat.id} className="group relative overflow-hidden bg-card border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: cat.color || '#4ade80' }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-medium text-white truncate pr-2">{cat.name}</h4>
                    <span className="text-sm font-mono text-muted-foreground">
                      ${spent.toLocaleString()} <span className="text-xs text-white/30">/ ${limit.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                    isOverBudget ? "bg-red-500" : "bg-primary"
                  )}
                  style={{ width: `${percent}%`, backgroundColor: isOverBudget ? '#ef4444' : cat.color || 'var(--primary)' }}
                />
              </div>
              
              {isOverBudget && (
                <p className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  Over budget by ${(spent - limit).toFixed(0)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
