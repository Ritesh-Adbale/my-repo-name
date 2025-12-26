import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { BottomNav } from "@/components/bottom-nav";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useState } from "react";
import { clsx } from "clsx";

export default function InsightsPage() {
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();
  const [view, setView] = useState<'month' | 'year'>('month');

  // Filter logic
  const now = new Date();
  const filteredTransactions = transactions?.filter(t => {
    const d = new Date(t.date);
    if (view === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return d.getFullYear() === now.getFullYear();
  }) || [];

  // Prepare Pie Chart Data (Expenses by Category)
  const expenseData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = categories?.find(c => c.id === t.categoryId);
      if (!cat) return acc;
      
      const existing = acc.find(item => item.name === cat.name);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        acc.push({ name: cat.name, value: Number(t.amount), color: cat.color || '#ccc' });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[])
    .sort((a, b) => b.value - a.value);

  // Prepare Bar Chart Data (Monthly Spending Trend)
  const monthlyData = transactions
    ?.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === now.getFullYear())
    .reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += Number(t.amount);
      } else {
        acc.push({ month, amount: Number(t.amount) });
      }
      return acc;
    }, [] as { month: string; amount: number }[])
    .sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

  const totalSpent = expenseData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="pt-8 px-6 pb-6">
        <h1 className="text-2xl font-bold font-display mb-6">Insights</h1>
        
        {/* Toggle */}
        <div className="flex bg-card p-1 rounded-xl border border-white/5 mb-8">
          <button
            onClick={() => setView('month')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              view === 'month' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setView('year')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              view === 'year' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
            )}
          >
            This Year
          </button>
        </div>

        {/* Total Overview */}
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
          <h2 className="text-4xl font-mono font-bold text-white">${totalSpent.toLocaleString()}</h2>
        </div>

        {/* Pie Chart */}
        <div className="bg-card rounded-3xl p-6 border border-white/5 mb-6">
          <h3 className="text-lg font-semibold mb-4">Breakdown</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`$${value}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Top</span>
              <p className="font-bold text-white">{expenseData[0]?.name || '-'}</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {expenseData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/80">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-mono font-medium">${item.value.toLocaleString()}</span>
                  <span className="text-muted-foreground w-8 text-right">{((item.value / totalSpent) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart (Only for Yearly view or if there is data) */}
        {monthlyData && monthlyData.length > 0 && (
          <div className="bg-card rounded-3xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#666', fontSize: 12 }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none' }}
                    itemStyle={{ color: '#4ade80' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#4ade80" 
                    radius={[4, 4, 4, 4]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
