import React, { useState } from 'react';
import { Search, Calendar, Box, ClipboardCheck, Tag } from 'lucide-react';

interface FeedSaleRecord {
  id: string;
  brand_name: string;
  quantity: number;
  price_per_bag: number;
  total_amount: number;
  sale_date: string;
  is_settled: boolean;
  seller_name: string;
  seller_code: string | null;
  owner_name: string;
  owner_dairy: string;
}

interface FeedProductRecord {
  id: string;
  brand_name: string;
  price_per_bag: number;
  owner_name: string;
  owner_dairy: string;
  created_at: string;
}

interface CattleFeedViewProps {
  feedSales: FeedSaleRecord[];
  feedProducts: FeedProductRecord[];
}

export const CattleFeedView: React.FC<CattleFeedViewProps> = ({ feedSales, feedProducts }) => {
  const [search, setSearch] = useState('');
  const [subTab, setSubTab] = useState<'sales' | 'products'>('sales');

  const filteredSales = feedSales.filter(sale => {
    const query = search.toLowerCase();
    return (
      sale.brand_name.toLowerCase().includes(query) ||
      sale.seller_name.toLowerCase().includes(query) ||
      (sale.seller_code && sale.seller_code.toLowerCase().includes(query)) ||
      sale.owner_name.toLowerCase().includes(query) ||
      sale.owner_dairy.toLowerCase().includes(query)
    );
  });

  const filteredProducts = feedProducts.filter(prod => {
    const query = search.toLowerCase();
    return (
      prod.brand_name.toLowerCase().includes(query) ||
      prod.owner_name.toLowerCase().includes(query) ||
      prod.owner_dairy.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-sans tracking-tight">
            Cattle Feed Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">
            Audit platform-wide feed product distributions, transaction histories, and pricing lists.
          </p>
        </div>

        {/* Sub-tab selectors */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('sales')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              subTab === 'sales' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Feed Sales Ledger
          </button>
          <button
            onClick={() => setSubTab('products')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              subTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Product Catalog
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder={subTab === 'sales' ? "Search sales by brand, supplier, or dairy..." : "Search catalog by brand name or dairy owner..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-2xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 font-sans transition-all duration-200 text-sm"
        />
      </div>

      {/* Content Rendering */}
      {subTab === 'sales' ? (
        filteredSales.length > 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Sale Date</th>
                    <th className="px-6 py-4">Brand / Product</th>
                    <th className="px-6 py-4">Supplier (Seller)</th>
                    <th className="px-6 py-4">Dairy (Owner)</th>
                    <th className="px-6 py-4 text-center">Bags</th>
                    <th className="px-6 py-4 text-right">Price per Bag</th>
                    <th className="px-6 py-4 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/25 transition-all duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-medium">{new Date(sale.sale_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-100 flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{sale.brand_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-100">{sale.seller_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Code: {sale.seller_code || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-100">{sale.owner_dairy}</div>
                        <div className="text-[10px] text-slate-500">{sale.owner_name}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-200">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 text-right">
                        ₹{sale.price_per_bag.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-indigo-400 font-bold">
                        ₹{sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sale.is_settled 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}>
                          <ClipboardCheck className="w-3 h-3" />
                          {sale.is_settled ? 'Settled' : 'Deduction Pending'}
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
            No cattle feed sales transactions found.
          </div>
        )
      ) : (
        filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-white text-base leading-tight font-sans">
                      {prod.brand_name}
                    </h3>
                  </div>

                  <div className="bg-slate-950/50 rounded-xl p-4 flex items-center justify-between border border-slate-850">
                    <span className="text-xs text-slate-400 font-sans">Retail Price</span>
                    <span className="text-indigo-400 font-bold text-lg font-sans">
                      ₹{prod.price_per_bag.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 font-normal">/ bag</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
                  <span className="text-slate-500 font-medium">Offered By:</span>
                  <span className="font-semibold text-slate-300">
                    {prod.owner_dairy} ({prod.owner_name})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
            No feed products found in the catalog.
          </div>
        )
      )}
    </div>
  );
};
