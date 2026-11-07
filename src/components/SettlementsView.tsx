import React, { useState } from 'react';
import { Search, Calendar, ArrowRight, ClipboardCheck, Clock } from 'lucide-react';

export interface SettlementRecord {
  id: string;
  start_date: string;
  end_date: string;
  total_milk_amount: number;
  total_feed_deduction: number;
  total_advance_deduction?: number;
  net_payable: number;
  status: string;
  created_at: string;
  seller_name: string;
  seller_code: string | null;
  owner_name: string;
  owner_dairy: string;
}

interface SettlementsViewProps {
  settlements: SettlementRecord[];
}

export const SettlementsView: React.FC<SettlementsViewProps> = ({ settlements }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const pendingCount = settlements.filter(s => s.status === 'pending').length;
  const pendingAmount = settlements.filter(s => s.status === 'pending').reduce((acc, curr) => acc + curr.net_payable, 0);

  const completedCount = settlements.filter(s => s.status === 'completed').length;
  const completedAmount = settlements.filter(s => s.status === 'completed').reduce((acc, curr) => acc + curr.net_payable, 0);

  const filteredSettlements = settlements.filter(item => {
    const query = search.toLowerCase();
    const matchesSearch = (
      item.seller_name.toLowerCase().includes(query) ||
      (item.seller_code && item.seller_code.toLowerCase().includes(query)) ||
      item.owner_name.toLowerCase().includes(query) ||
      item.owner_dairy.toLowerCase().includes(query)
    );

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && item.status === filterStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            Settlement Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit approved payouts and view pending billing statements across all suppliers with feed & advance deductions.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          {[
            { id: 'all', label: `All (${settlements.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'completed', label: `Paid (${completedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                filterStatus === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Payout Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex justify-between items-center shadow-lg">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Unsettled (Pending) Payouts
            </span>
            <div className="text-2xl font-bold text-white">
              ₹{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {pendingCount} suppliers awaiting settlement cycles
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Completed Paid Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex justify-between items-center shadow-lg">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Completed (Paid) Settlements
            </span>
            <div className="text-2xl font-bold text-white">
              ₹{completedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 block">
              {completedCount} settlements successfully generated
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by supplier name, code, dairy name, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-2xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 transition-all duration-200 text-sm"
        />
      </div>

      {/* Table view */}
      {filteredSettlements.length > 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Settlement Period</th>
                  <th className="px-6 py-4">Supplier (Seller)</th>
                  <th className="px-6 py-4">Dairy (Owner)</th>
                  <th className="px-6 py-4 text-right">Milk Value</th>
                  <th className="px-6 py-4 text-right">Feed Deductions</th>
                  <th className="px-6 py-4 text-right">Advance Deductions</th>
                  <th className="px-6 py-4 text-right">Net Payout</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {filteredSettlements.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/25 transition-all duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-medium whitespace-nowrap">
                          {new Date(record.start_date).toLocaleDateString()}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="font-medium whitespace-nowrap">
                          {new Date(record.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {record.status === 'pending' ? 'Unsettled collections' : `Settled: ${new Date(record.created_at).toLocaleDateString()}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{record.seller_name}</div>
                      <div className="text-[10px] text-indigo-400 font-mono">Code: {record.seller_code || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{record.owner_dairy}</div>
                      <div className="text-[10px] text-slate-500">{record.owner_name}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹{record.total_milk_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-400 font-medium">
                      -₹{record.total_feed_deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-amber-400 font-medium">
                      -₹{(record.total_advance_deduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                      ₹{record.net_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {record.status === 'pending' ? <Clock className="w-3 h-3" /> : <ClipboardCheck className="w-3 h-3" />}
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
          No settlements found matching the search/filter parameters.
        </div>
      )}
    </div>
  );
};
