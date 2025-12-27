import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import TransactionsPage from "@/pages/transactions";
import InsightsPage from "@/pages/insights";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import React, { useEffect, useState } from "react";
import PinLock from "@/components/pin-lock";
import { hasPin } from "@/lib/pinAuth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [locked, setLocked] = useState<boolean>(hasPin());
  useEffect(() => {
    function lock() {
      setLocked(true);
    }
    function visibility() {
      if (document.visibilityState !== "visible") lock();
    }
    window.addEventListener("pagehide", lock);
    window.addEventListener("blur", lock);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", lock);
      window.removeEventListener("blur", lock);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  function onUnlock(_key: CryptoKey) {
    setLocked(false);
  }
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="antialiased text-foreground bg-background min-h-screen font-body selection:bg-primary/20 selection:text-primary">
          {locked ? <PinLock onUnlock={onUnlock} /> : <Router />}
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
