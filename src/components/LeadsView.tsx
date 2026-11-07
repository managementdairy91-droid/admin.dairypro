import React, { useState } from 'react';
import { Search, Phone, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';

export interface ContactRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
}

interface LeadsViewProps {
  leads: ContactRequest[];
  onApproveLead: (lead: ContactRequest) => Promise<void>;
  onRejectLead: (leadId: string) => Promise<void>;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ leads, onApproveLead, onRejectLead }) => {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const filteredLeads = leads.filter(lead => {
    // 1. Tab filter
    if (filterTab !== 'all' && lead.status !== filterTab) return false;

    // 2. Search query filter
    const query = search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone_number.includes(query)
    );
  });

  const handleApprove = async (lead: ContactRequest) => {
    setActioningId(lead.id);
    try {
      await onApproveLead(lead);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (leadId: string) => {
    setActioningId(leadId);
    try {
      await onRejectLead(leadId);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-sans tracking-tight">
            Contact Requests & Leads
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">
            Review contact requests submitted by unverified owners and grant them dairy access.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-200 ${
                filterTab === tab 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by lead name, email, or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-2xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 font-sans transition-all duration-200 text-sm"
        />
      </div>

      {/* Leads Grid/List */}
      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => {
            const isApproved = lead.status === 'approved';
            const isRejected = lead.status === 'rejected';

            return (
              <div 
                key={lead.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight font-sans">
                        {lead.name}
                      </h3>
                      <span className="text-[10px] text-slate-550 font-sans">
                        Lead ID: <span className="font-mono text-indigo-400 font-semibold">{lead.id.substring(0, 8)}</span>
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${
                      isApproved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : isRejected
                        ? 'bg-slate-500/10 text-slate-400 border border-slate-550/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                    }`}>
                      {lead.status}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/50 text-xs text-slate-400 font-sans">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{lead.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{new Date(lead.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isApproved && !isRejected && (
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      disabled={actioningId === lead.id}
                      onClick={() => handleReject(lead.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-bold transition-all duration-200"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      disabled={actioningId === lead.id}
                      onClick={() => handleApprove(lead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Owner
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 font-sans">
          No contact requests found matching the search/filter criteria.
        </div>
      )}
    </div>
  );
};
