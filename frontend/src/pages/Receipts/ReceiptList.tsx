import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { receiptApi } from '../../services/documentApi';
import type { Receipt, ReceiptFilters, ReceiptStats } from '../../types/receipt';
import Pagination from '../../components/Pagination';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Calendar, DollarSign, Tag, Receipt as ReceiptIcon, ShoppingBag, TrendingUp } from 'lucide-react';

const ReceiptList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<ReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ReceiptFilters>({ search: '', category: '', dateFrom: '', dateTo: '', isBusiness: '' });

  useEffect(() => { fetchReceipts(); fetchStats(); }, [page, limit, filters]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptApi.getReceipts(filters, page, limit);
      setReceipts(response.data || []);
      setTotal(response.meta?.pagination?.total || 0);
    } catch { showToast('Failed to fetch receipts', 'error'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const r = await receiptApi.getReceiptStats(); setStats(r.data); }
    catch { console.error('Error fetching receipt stats'); }
  };

  const handleFilterChange = (key: keyof ReceiptFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatCurrency = (amount: number | null, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount || 0);

  const categories = ['Food & Beverage', 'Travel', 'Supplies', 'Utilities', 'Marketing', 'Other'];

  const statItems = [
    { label: 'Total Expenses', value: stats ? formatCurrency(stats.total_amount, 'USD') : '$0.00', icon: DollarSign, color: 'text-success', bg: 'bg-success/10 border-success/20' },
    { label: 'Processed Count', value: `${total} Receipts`, icon: ReceiptIcon, color: 'text-white', bg: 'bg-white/10 border-white/20' },
    { label: 'Top Category', value: stats?.category_breakdown[0]?.category || 'N/A', icon: Tag, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Receipts Gallery</h1>
            <p className="mt-1 text-sm text-[#444444]">Track and categorize your expenses with AI assistance.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/receipts/analytics')}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#111111] text-[#888888] rounded-lg hover:bg-[#111111] hover:text-white transition-colors flex items-center gap-2 font-medium text-sm">
              <TrendingUp className="w-4 h-4" /> View Analytics
            </button>
            <button onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#A0A0A0] text-[#888888] rounded-lg hover:bg-[#111111] hover:shadow-glow-white-sm transition-colors flex items-center gap-2 font-medium text-sm">
              <ReceiptIcon className="w-4 h-4" /> Upload Receipt
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((s) => (
            <div key={s.label} className="bg-[#0A0A0A] border border-[#111111] p-4 rounded-xl flex items-center gap-4">
              <div className={`p-3 rounded-lg border ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-[#444444] font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#111111] p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444444] w-4 h-4" />
              <input type="text" placeholder="Search merchant..." value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors" />
            </div>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white focus:outline-none focus:border-[#A0A0A0] transition-colors">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="biz" checked={!!filters.isBusiness}
                onChange={(e) => handleFilterChange('isBusiness', e.target.checked)}
                className="w-4 h-4 accent-[#A0A0A0] border-[#111111] rounded" />
              <label htmlFor="biz" className="text-sm font-medium text-[#888888]">Business Only</label>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0A0A0]" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="bg-[#0A0A0A] border-2 border-dashed border-[#111111] rounded-xl py-20 text-center">
            <ShoppingBag className="w-12 h-12 text-[#444444] mx-auto mb-4" />
            <p className="text-[#444444]">No receipts found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {receipts.map((receipt) => (
              <div key={receipt.id} onClick={() => navigate(`/receipts/${receipt.id}`)}
                className="group bg-[#0A0A0A] border border-[#111111] rounded-xl overflow-hidden hover:border-[#A0A0A0] transition-all cursor-pointer">
                <div className="aspect-[4/3] bg-black relative overflow-hidden">
                  {receipt.document?.file_path ? (
                    <img src={receipt.document.file_path} alt={receipt.merchant_name || 'Receipt'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#282828]">
                      <ReceiptIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded backdrop-blur border ${receipt.is_business_expense ? 'bg-white/10 border-white/30 text-white' : 'bg-[#0A0A0A]/80 border-[#111111] text-[#444444]'}`}>
                      {receipt.is_business_expense ? 'Business' : 'Personal'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white truncate flex-1">{receipt.merchant_name || 'Unidentified Merchant'}</h3>
                    <p className="text-white font-bold ml-2">{formatCurrency(receipt.total_amount, receipt.currency)}</p>
                  </div>
                  <div className="flex items-center text-xs text-[#444444] gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {receipt.purchase_date ? new Date(receipt.purchase_date).toLocaleDateString() : 'N/A'}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {receipt.category || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} totalItems={total} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
      </div>
    </DashboardLayout>
  );
};

export default ReceiptList;
