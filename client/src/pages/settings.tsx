import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CURRENCIES, getCurrency, setCurrency } from "@/lib/storage";
import { BottomNav } from "@/components/bottom-nav";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [selectedCurrency, setSelectedCurrency] = useState(getCurrency());

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    setCurrency(code);
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
