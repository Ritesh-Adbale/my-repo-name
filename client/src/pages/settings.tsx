import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCIES, getCurrency, setCurrency, getMonthlyBudget, setMonthlyBudget } from "@/lib/storage";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [selectedCurrency, setSelectedCurrency] = useState(getCurrency());
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadBudgets = async () => {
      // Load current and nearby months
      const now = new Date();
      for (let i = -1; i <= 1; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() + i);
        const yearMonth = format(d, "yyyy-MM");
        const limit = await getMonthlyBudget(yearMonth);
        setMonthlyBudgets(prev => ({ ...prev, [yearMonth]: limit }));
      }
      setIsLoading(false);
    };
    loadBudgets();
  }, []);

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    setCurrency(code);
  };

  const handleBudgetChange = async (yearMonth: string, limit: number) => {
    if (limit < 0) return;
    const newLimit = await setMonthlyBudget(yearMonth, limit);
    setMonthlyBudgets(prev => ({ ...prev, [yearMonth]: newLimit }));
    toast({ title: "Budget updated", description: `Monthly budget for ${yearMonth} has been saved.` });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="pt-6 px-6 pb-6 flex items-center gap-4">
        <button
          onClick={() => setLocation("/")}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          data-testid="button-back"
        >
          <ChevronLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-white/80">Settings</h1>
      </div>

      {/* Currency Selection */}
      <div className="px-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white/80">Currency</h2>
          <div className="space-y-2">
            {Object.entries(CURRENCIES).map(([code, currency]) => (
              <button
                key={code}
                onClick={() => handleCurrencyChange(code)}
                className="w-full"
                data-testid={`button-currency-${code}`}
              >
                <Card
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                    selectedCurrency === code
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{currency.symbol}</div>
                    <div className="text-left">
                      <div className="font-medium text-white">{currency.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {currency.name}
                      </div>
                    </div>
                  </div>
                  {selectedCurrency === code && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </Card>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Budget Settings */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white/80">Monthly Spending Limits</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              Object.entries(monthlyBudgets).map(([yearMonth, limit]) => (
                <div key={yearMonth} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white/60 min-w-[100px]">{yearMonth}</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                    <Input
                      type="number"
                      value={limit}
                      onChange={(e) => handleBudgetChange(yearMonth, Number(e.target.value))}
                      className="pl-7 bg-card border-white/5 rounded-lg"
                      data-testid={`input-budget-${yearMonth}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* About */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            About
          </h3>
          <p className="text-xs text-muted-foreground">
            Budget Tracker v1.0
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Your data is stored locally on this device.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
