import { useState } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BudgetCard } from "@/components/budget-card";
import { CategoryList } from "@/components/category-list";
import { useTransactions } from "@/hooks/use-transactions";
import { BottomNav } from "@/components/bottom-nav";
import { TransactionFab } from "@/components/transaction-fab";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const { data: transactions } = useTransactions();

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
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm font-medium w-24 text-center">
              {format(date, "MMMM yyyy")}
            </span>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
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
