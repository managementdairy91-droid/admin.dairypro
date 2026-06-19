import React, { useState } from 'react';
import { Search, Phone, MapPin, IndianRupee } from 'lucide-react';

interface SellerProfile {
  id: string;
  name: string;
  seller_code: string | null;
  phone_number?: string | null;
  village: string | null;
  address: string | null;
  balance_amount: number;
  is_active: boolean;
  owner_name: string;      // Joined from users table
  owner_dairy: string;     // Joined from users table
  created_at: string;
}

interface SellersViewProps {
  sellers: SellerProfile[];
}

export const SellersView: React.FC<SellersViewProps> = ({ sellers }) => {
  const [search, setSearch] = useState('');
  
  const filteredSellers = sellers.filter(seller => {
    const query = search.toLowerCase();
    return (
      seller.name.toLowerCase().includes(query) ||
      (seller.seller_code && seller.seller_code.toLowerCase().includes(query)) ||
      (seller.village && seller.village.toLowerCase().includes(query)) ||
      seller.owner_name.toLowerCase().includes(query) ||
      seller.owner_dairy.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-sans tracking-tight">
          System Suppliers (Sellers)
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-sans">
          Audit supplier statistics, current balances, and geographical distribution across dairies.
        </p>
      </div>

      {/* Control Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by supplier name, code, village, or parent dairy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-2xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 font-sans transition-all duration-200 text-sm"
        />
      </div>

      {/* Sellers Grid/List */}
      {filteredSellers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => (
            <div 
              key={seller.id}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-6 shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight font-sans">
                      {seller.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Code: <span className="font-mono text-indigo-400 font-semibold">{seller.seller_code || 'N/A'}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${
                    seller.is_active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {seller.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Account Details */}
                <div className="bg-slate-950/50 rounded-xl p-4 flex items-center justify-between border border-slate-850">
                  <span className="text-xs text-slate-400 font-sans font-medium">Outstanding Balance</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg font-sans">
                    <IndianRupee className="w-4 h-4" />
                    <span>{seller.balance_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 pt-2 border-t border-slate-800/50 text-xs text-slate-400 font-sans">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{seller.village || 'No Village Assigned'}</span>
                  </div>
                  {seller.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{seller.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connected Dairy details */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
                <span className="text-slate-500">Connected Dairy:</span>
                <span className="font-semibold text-indigo-400 text-right max-w-[60%] truncate">
                  {seller.owner_dairy} ({seller.owner_name})
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
          No sellers found matching the search criteria.
        </div>
      )}
    </div>
  );
};
