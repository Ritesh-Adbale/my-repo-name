import { clsx } from "clsx";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

interface BudgetCardProps {
  balance: number;
  income: number;
  expenses: number;
}

export function BudgetCard({ balance, income, expenses }: BudgetCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-card/50 border border-white/5 p-6 shadow-2xl">
      {/* Background glow effect */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Total Balance</span>
        </div>
        <h2 className="text-4xl font-bold font-mono text-white mb-8 tracking-tight">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="p-1 rounded-full bg-emerald-400/10">
                <ArrowUpRight className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold uppercase">Income</span>
            </div>
            <p className="text-lg font-mono font-medium text-white/90">
              ${income.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400">
              <div className="p-1 rounded-full bg-rose-400/10">
                <ArrowDownRight className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold uppercase">Expenses</span>
            </div>
            <p className="text-lg font-mono font-medium text-white/90">
              ${expenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
