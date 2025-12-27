import { Link, useLocation } from "wouter";
import { Home, List, PieChart, Settings } from "lucide-react";
import { clsx } from "clsx";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Budget" },
    { href: "/transactions", icon: List, label: "Transactions" },
    { href: "/insights", icon: PieChart, label: "Insights" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 bg-card/80 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="group w-full">
              <div className="flex flex-col items-center justify-center gap-1 cursor-pointer">
                <div
                  className={clsx(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary scale-110"
                      : "text-muted-foreground group-hover:text-primary/70"
                  )}
                >
                  <item.icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-transform duration-300"
                  />
                </div>
                <span
                  className={clsx(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
