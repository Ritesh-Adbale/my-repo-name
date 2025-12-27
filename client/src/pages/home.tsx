import { useState, useEffect } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, TrendingDown } from "lucide-react";
import { BudgetCard } from "@/components/budget-card";
import { CategoryList } from "@/components/category-list";
import { useTransactions } from "@/hooks/use-transactions";
import { BottomNav } from "@/components/bottom-nav";
import { TransactionFab } from "@/components/transaction-fab";
import { getMonthlyBudget, formatAmount } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [monthlyLimit, setMonthlyLimit] = useState(30000);
  const { data: transactions } = useTransactions();

  useEffect(() => {
    const yearMonth = format(date, "yyyy-MM");
    getMonthlyBudget(yearMonth).then(setMonthlyLimit);
  }, [date]);

  const currentMonthTransactions = transactions?.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
  }) || [];

  const income = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));

  const budgetUsed = expenses;
  const budgetPercent = Math.min((budgetUsed / monthlyLimit) * 100, 100);
  const budgetRemaining = Math.max(monthlyLimit - budgetUsed, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header / Month Selector */}
      <div className="pt-8 px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white/80">My Budget</h1>
          <div className="flex items-center bg-card rounded-full border border-white/5 p-1">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
              data-testid="button-prev-month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm font-medium w-24 text-center">
              {format(date, "MMMM yyyy")}
            </span>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
              data-testid="button-next-month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <BudgetCard 
          balance={balance}
          income={income}
          expenses={expenses}
        />

        {/* Monthly Budget Counter */}
        <div className="bg-card border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Monthly Budget</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{budgetPercent.toFixed(0)}%</span>
          </div>
          <Progress value={budgetPercent} className="h-2 mb-3" />
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-mono font-medium text-white mt-0.5">{formatAmount(budgetUsed)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Limit</p>
              <p className="font-mono font-medium text-white mt-0.5">{formatAmount(monthlyLimit)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className={`font-mono font-medium mt-0.5 ${budgetRemaining > 0 ? 'text-primary' : 'text-red-400'}`}>
                {formatAmount(budgetRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-8">
        <CategoryList />
      </div>

      <TransactionFab />
      <BottomNav />
    </div>
  );
}
