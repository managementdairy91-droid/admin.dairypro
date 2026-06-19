import React from 'react';
import { 
  Users, 
  UserCheck, 
  Droplet, 
  IndianRupee, 
  ShieldAlert,
  TrendingUp,
  Box
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DashboardViewProps {
  stats: {
    totalOwners: number;
    totalSellers: number;
    pendingOwners: number;
    totalMilkLiters: number;
    totalMilkValue: number;
    approvedSettlements: number;
    pendingSettlements: number;
    activeSubscriptions: number;
    totalFeedBags: number;
    totalFeedAmount: number;
    pendingFeedDeductions: number;
  };
  chartsData: {
    milkTrends: Array<{ date: string; quantity: number }>;
    settlementTrends: Array<{ date: string; amount: number }>;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, chartsData }) => {
  const kpiCards = [
    {
      title: 'Total Dairy Owners',
      value: stats.totalOwners,
      sub: `${stats.activeSubscriptions} Active Subscriptions`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      glow: 'shadow-blue-500/10',
    },
    {
      title: 'Connected Sellers',
      value: stats.totalSellers,
      sub: 'Active milk suppliers',
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/10',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingOwners,
      sub: stats.pendingOwners > 0 ? 'Requires immediate action' : 'All clear',
      icon: ShieldAlert,
      color: stats.pendingOwners > 0 ? 'from-rose-500 to-red-600 animate-pulse' : 'from-slate-600 to-slate-700',
      glow: stats.pendingOwners > 0 ? 'shadow-rose-500/20' : 'shadow-slate-500/10',
    },
    {
      title: 'Total Milk Handled',
      value: `${stats.totalMilkLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })} L`,
      sub: `Estimated value: ₹${stats.totalMilkValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: Droplet,
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/10',
    },
    {
      title: 'Settlement Ledger',
      value: `₹${(stats.approvedSettlements + stats.pendingSettlements).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      sub: `₹${stats.approvedSettlements.toLocaleString(undefined, { maximumFractionDigits: 0 })} Approved | ₹${stats.pendingSettlements.toLocaleString(undefined, { maximumFractionDigits: 0 })} Pending`,
      icon: IndianRupee,
      color: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/10',
    },
    {
      title: 'Cattle Feed Sales',
      value: `${stats.totalFeedBags.toLocaleString()} Bags`,
      sub: `Vol: ₹${stats.totalFeedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} | Deductions: ₹${stats.pendingFeedDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })} Pending`,
      icon: Box,
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/10',
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-sans tracking-tight">
          System Overview
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-sans">
          Real-time metrics, system health indices, and subscription statuses across India's dairy network.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/80 hover:translate-y-[-2px] shadow-lg ${card.glow}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-sans">
                    {card.title}
                  </span>
                  <div className="text-2xl font-bold text-white font-sans tracking-tight">
                    {card.value}
                  </div>
                  <span className="text-xs text-slate-500 font-sans block mt-1">
                    {card.sub}
                  </span>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Milk Collection Trends */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-200 font-sans">Milk Collection Trends</h2>
              <p className="text-xs text-slate-500 font-sans">Daily volume handled by the platform (Liters)</p>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="h-80 w-full">
            {chartsData.milkTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartsData.milkTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="milkColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontFamily: 'Outfit' }}
                    itemStyle={{ color: '#fff', fontFamily: 'Outfit' }}
                  />
                  <Area type="monotone" dataKey="quantity" name="Liters" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#milkColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No milk collection records found.
              </div>
            )}
          </div>
        </div>

        {/* Settlement Payout Volume */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-200 font-sans">Settlement Volume</h2>
              <p className="text-xs text-slate-500 font-sans">Platform payout aggregations over time (₹)</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="h-80 w-full">
            {chartsData.settlementTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.settlementTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontFamily: 'Outfit' }}
                    itemStyle={{ color: '#fff', fontFamily: 'Outfit' }}
                  />
                  <Bar dataKey="amount" name="Payout (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No settlement payout records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
