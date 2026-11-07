import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Search, 
  Settings, 
  Phone, 
  MapPin, 
  Coffee,
  Sparkles
} from 'lucide-react';

export interface OwnerProfile {
  id: string;
  full_name: string;
  phone_number: string | null;
  dairy_name: string | null;
  address: string | null;
  city_village: string | null;
  pincode: string | null;
  fat_rate: number | null;
  snf_rate: number | null;
  is_approved: boolean;
  subscription_status: string;
  subscription_plan?: string | null;
  subscription_expires_at: string | null;
  created_at: string;
}

interface OwnersViewProps {
  owners: OwnerProfile[];
  onToggleApproval: (ownerId: string, currentStatus: boolean) => Promise<void>;
  onUpdateSubscription: (ownerId: string, status: string, expiresAt: string | null, planType?: string) => Promise<void>;
}

export const OwnersView: React.FC<OwnersViewProps> = ({ 
  owners, 
  onToggleApproval, 
  onUpdateSubscription 
}) => {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'active' | 'expired'>('all');
  const [selectedOwner, setSelectedOwner] = useState<OwnerProfile | null>(null);
  
  // Local edit states for subscription modal
  const [subStatus, setSubStatus] = useState('inactive');
  const [subPlanType, setSubPlanType] = useState('monthly');
  const [subExpiryDate, setSubExpiryDate] = useState('');

  const filteredOwners = owners.filter(owner => {
    // 1. Tab filter
    if (filterTab === 'pending' && owner.is_approved) return false;
    if (filterTab === 'active' && owner.subscription_status !== 'active') return false;
    if (filterTab === 'expired' && owner.subscription_status === 'active') return false;

    // 2. Search query filter
    const query = search.toLowerCase();
    return (
      owner.full_name.toLowerCase().includes(query) ||
      (owner.dairy_name && owner.dairy_name.toLowerCase().includes(query)) ||
      (owner.phone_number && owner.phone_number.includes(query)) ||
      (owner.subscription_plan && owner.subscription_plan.toLowerCase().includes(query))
    );
  });

  const openSubscriptionModal = (owner: OwnerProfile) => {
    setSelectedOwner(owner);
    setSubStatus(owner.subscription_status);
    setSubPlanType(owner.subscription_plan || 'monthly');
    if (owner.subscription_expires_at) {
      setSubExpiryDate(new Date(owner.subscription_expires_at).toISOString().split('T')[0]);
    } else {
      setSubExpiryDate('');
    }
  };

  const handleApplyPreset = (days: number, plan: 'monthly' | 'half_yearly' | 'annual') => {
    let start = new Date();
    if (selectedOwner?.subscription_expires_at) {
      const existing = new Date(selectedOwner.subscription_expires_at);
      if (existing > start) {
        start = existing;
      }
    }
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    setSubExpiryDate(end.toISOString().split('T')[0]);
    setSubStatus('active');
    setSubPlanType(plan);
  };

  const handleSaveSubscription = async () => {
    if (!selectedOwner) return;
    const dateFormatted = subExpiryDate ? new Date(subExpiryDate).toISOString() : null;
    await onUpdateSubscription(selectedOwner.id, subStatus, dateFormatted, subPlanType);
    setSelectedOwner(null);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            Manage Dairy Owners
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Validate user profiles, approve dashboard access, and configure monthly/yearly subscription expirations.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          {(['all', 'pending', 'active', 'expired'] as const).map((tab) => (
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
          placeholder="Search by owner name, dairy name, phone number or plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-2xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 transition-all duration-200 text-sm"
        />
      </div>

      {/* Owner Grid List */}
      {filteredOwners.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredOwners.map((owner) => (
            <div 
              key={owner.id}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 shadow-lg transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4 flex-1">
                  {/* Title & Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                      {owner.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {owner.full_name}
                      </h3>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                        {owner.dairy_name || 'No Dairy Onboarded'}
                      </p>
                    </div>
                    
                    {/* Approval Indicator */}
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                      owner.is_approved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                    }`}>
                      {owner.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>

                  {/* Profile Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{owner.phone_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{owner.city_village ? `${owner.city_village}, ${owner.pincode}` : (owner.address || 'N/A')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-3.5 h-3.5 text-slate-500" />
                      <span>FAT: {owner.fat_rate || '6.0'} | SNF: {owner.snf_rate || '3.0'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sub Expires: {owner.subscription_expires_at ? new Date(owner.subscription_expires_at).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                </div>

                {/* Subscription Badge */}
                <div className="text-right space-y-1.5 shrink-0">
                  <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                    owner.subscription_status === 'active' 
                      ? 'bg-emerald-500 text-white' 
                      : owner.subscription_status === 'trial'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {owner.subscription_status.toUpperCase()}
                  </span>
                  {owner.subscription_plan && (
                    <span className="block text-[10px] font-bold text-indigo-400 uppercase">
                      {owner.subscription_plan.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => onToggleApproval(owner.id, owner.is_approved)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    owner.is_approved 
                      ? 'bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {owner.is_approved ? (
                    <>
                      <XCircle className="w-4 h-4" /> Revoke Access
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Approve Owner
                    </>
                  )}
                </button>

                <button
                  onClick={() => openSubscriptionModal(owner)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all duration-200"
                >
                  <Settings className="w-4 h-4" /> Subscription Config
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
          No dairy owners found matching the selected filter criteria.
        </div>
      )}

      {/* Subscription Editor Modal */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Subscription Config</h3>
              <p className="text-slate-400 text-xs mt-1">
                Configure access tier and plan expiration for {selectedOwner.full_name} ({selectedOwner.dairy_name || 'Farm'}).
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Add Plan Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(30, 'monthly')}
                  className="px-2 py-2 bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all text-center"
                >
                  <div>+30 Days</div>
                  <span className="text-[10px] text-slate-500 block font-normal">Monthly</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset(180, 'half_yearly')}
                  className="px-2 py-2 bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all text-center"
                >
                  <div>+180 Days</div>
                  <span className="text-[10px] text-slate-500 block font-normal">6 Months</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset(365, 'annual')}
                  className="px-2 py-2 bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all text-center"
                >
                  <div>+365 Days</div>
                  <span className="text-[10px] text-slate-500 block font-normal">1 Year</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">Subscription Status</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="trial">Trial Period</option>
                  <option value="inactive">Inactive (Suspended)</option>
                </select>
              </div>

              {/* Plan Type Select */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">Assigned Plan Tier</label>
                <select
                  value={subPlanType}
                  onChange={(e) => setSubPlanType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="monthly">Monthly Plan (₹199)</option>
                  <option value="half_yearly">Half-Yearly Plan (₹899)</option>
                  <option value="annual">Annual VIP Plan (₹1,499)</option>
                </select>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">Expiration Date</label>
                <input
                  type="date"
                  value={subExpiryDate}
                  onChange={(e) => setSubExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOwner(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubscription}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
