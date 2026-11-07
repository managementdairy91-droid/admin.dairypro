import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  Clock, 
  Receipt, 
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

export interface SubscriptionRequestRecord {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  payment_reference: string;
  status: string;
  notes: string;
  created_at: string;
  owner_name: string;
  owner_dairy: string;
  owner_phone: string;
  owner_email: string;
}

export interface SubscriptionPaymentRecord {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  razorpay_payment_id: string | null;
  status: string;
  starts_at: string;
  expires_at: string;
  source: string;
  created_at: string;
  owner_name: string;
  owner_dairy: string;
}

interface SubscriptionsViewProps {
  requests: SubscriptionRequestRecord[];
  payments: SubscriptionPaymentRecord[];
  onApproveRequest: (request: SubscriptionRequestRecord) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  requests,
  payments,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [subTab, setSubTab] = useState<'requests' | 'payments'>('requests');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
  const totalVerifiedRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      req.owner_name.toLowerCase().includes(q) ||
      req.owner_dairy.toLowerCase().includes(q) ||
      req.owner_phone.includes(q) ||
      req.owner_email.toLowerCase().includes(q) ||
      req.payment_reference.toLowerCase().includes(q) ||
      req.plan_type.toLowerCase().includes(q)
    );
  });

  const filteredPayments = payments.filter(p => {
    const q = search.toLowerCase();
    return (
      p.owner_name.toLowerCase().includes(q) ||
      p.owner_dairy.toLowerCase().includes(q) ||
      (p.razorpay_payment_id && p.razorpay_payment_id.toLowerCase().includes(q)) ||
      p.plan_type.toLowerCase().includes(q)
    );
  });

  const handleApprove = async (req: SubscriptionRequestRecord) => {
    setActioningId(req.id);
    try {
      await onApproveRequest(req);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActioningId(requestId);
    try {
      await onRejectRequest(requestId);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            Subscription & Payment Controls
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage Razorpay subscription activations, emergency UTR backup queue, and real-time transaction ledger.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setSubTab('requests')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              subTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Verification Queue</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('payments')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              subTab === 'payments' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Transaction Logs ({payments.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Verifications</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pendingRequestsCount} Requests</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Owners waiting for one-click activation</span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Revenue</span>
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">₹{totalVerifiedRevenue.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Total payments processed</span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Gateway</span>
            <CreditCard className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">Razorpay Live</div>
          <span className="text-[11px] text-indigo-400 mt-1 block">Webhook & Autopay Sync Active</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={subTab === 'requests' ? 'Search by owner, dairy, phone, UTR or plan...' : 'Search transactions...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {subTab === 'requests' && (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  statusFilter === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content View 1: Verification Queue */}
      {subTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const planUpper = req.plan_type.replace('_', ' ').toUpperCase();

                return (
                  <div
                    key={req.id}
                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                            {req.owner_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white text-base block leading-tight">{req.owner_name}</span>
                            <span className="text-xs text-indigo-400 font-semibold">{req.owner_dairy}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ml-auto md:ml-0 ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isRejected
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* User Contact Details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl">
                        {req.owner_email && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`mailto:${req.owner_email}`} className="hover:text-indigo-400 transition-colors">
                              {req.owner_email}
                            </a>
                          </div>
                        )}
                        {req.owner_phone && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`tel:${req.owner_phone}`} className="hover:text-indigo-400 transition-colors">
                              {req.owner_phone}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                          <span className="text-slate-500 mr-1">Plan:</span>
                          <span className="font-bold text-indigo-400">{planUpper} (₹{req.amount})</span>
                        </div>

                        <div className="bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                          <span className="text-amber-500/70 mr-1">UTR / Payment ID:</span>
                          <span className="font-mono font-bold text-amber-300">{req.payment_reference || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(req.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-850">
                          <span className="text-slate-500 not-italic font-semibold">Notes: </span>
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actioningId === req.id}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApprove(req)}
                          disabled={actioningId === req.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Unlock</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
              No subscription verification requests match your filter.
            </div>
          )}
        </div>
      )}

      {/* Content View 2: Payment Transaction Logs */}
      {subTab === 'payments' && (
        <div className="space-y-4">
          {filteredPayments.length > 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 uppercase text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Owner / Dairy</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Razorpay Reference</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Valid Period</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white">{p.owner_name}</div>
                          <div className="text-[11px] text-slate-500">{p.owner_dairy}</div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize font-semibold text-indigo-400">{p.plan_type.replace('_', ' ')}</span>
                        </td>
                        <td className="p-4 font-bold text-emerald-400 text-sm">
                          ₹{Number(p.amount).toFixed(2)}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {p.razorpay_payment_id || 'DIRECT_GRANT'}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                            {p.source}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(p.starts_at).toLocaleDateString()} ➔ {new Date(p.expires_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
              No verified payment transactions recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
