import { useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { BottomNav } from "@/components/bottom-nav";
import { TransactionFab } from "@/components/transaction-fab";
import { format } from "date-fns";
import { Search, Filter, ShoppingCart, Home, Briefcase, Film, Coffee, Car, Heart, Zap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";

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

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions
    ?.filter(t => 
      t.note?.toLowerCase().includes(search.toLowerCase()) || 
      t.amount.toString().includes(search)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by date
  const groupedTransactions = filteredTransactions?.reduce((acc, transaction) => {
    const dateKey = format(new Date(transaction.date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-8 px-6 pb-4 border-b border-white/5">
        <h1 className="text-2xl font-bold font-display mb-4">Transactions</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9 bg-card border-white/5 rounded-xl h-10 focus-visible:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 pt-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
             {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : Object.keys(groupedTransactions || {}).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 opacity-50" />
            </div>
            <p>No transactions found</p>
          </div>
        ) : (
          Object.entries(groupedTransactions || {}).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider sticky top-[130px] bg-background/95 py-2">
                {format(new Date(date), "EEEE, MMM d")}
              </h3>
              
              <div className="space-y-2">
                {items?.map((t) => {
                  const category = categories?.find(c => c.id === t.categoryId);
                  const Icon = ICON_MAP[category?.icon || 'circle'] || AlertCircle;
                  const isIncome = t.type === 'income';

                  return (
                    <div 
                      key={t.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-opacity-90 shadow-sm"
                          style={{ backgroundColor: isIncome ? 'var(--primary)' : (category?.color || '#333') }}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">{category?.name || 'Uncategorized'}</p>
                          {t.note && <p className="text-xs text-muted-foreground truncate max-w-[150px]">{t.note}</p>}
                        </div>
                      </div>
                      <span className={clsx(
                        "font-mono font-medium",
                        isIncome ? "text-primary" : "text-white"
                      )}>
                        {isIncome ? "+" : "-"}${Number(t.amount).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <TransactionFab />
      <BottomNav />
    </div>
  );
}
