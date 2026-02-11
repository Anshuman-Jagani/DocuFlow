import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { receiptApi } from '../../services/documentApi';
import type { Receipt, ReceiptFilters, ReceiptStats } from '../../types/receipt';
import Pagination from '../../components/Pagination';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Search,
  Calendar,
  DollarSign,
  Tag,
  Receipt as ReceiptIcon,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

const ReceiptList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<ReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Grid 3x4
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState<ReceiptFilters>({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    isBusiness: '',
  });

  useEffect(() => {
    fetchReceipts();
    fetchStats();
  }, [page, limit, filters]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptApi.getReceipts(filters, page, limit);
      setReceipts(response.data || []);
      setTotal(response.meta?.pagination?.total || 0);
    } catch (error: any) {
      showToast('Failed to fetch receipts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await receiptApi.getReceiptStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching receipt stats');
    }
  };

  const handleFilterChange = (key: keyof ReceiptFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const categories = [
    'Food & Beverage',
    'Travel',
    'Supplies',
    'Utilities',
    'Marketing',
    'Other'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receipts Gallery</h1>
            <p className="mt-1 text-sm text-gray-500">Track and categorize your expenses with AI assistance.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/receipts/analytics')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
            >
              <TrendingUp className="w-5 h-5" />
              View Analytics
            </button>
            <button 
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <ReceiptIcon className="w-5 h-5" />
              Upload Receipt
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900">{stats ? formatCurrency(stats.total_amount, 'USD') : '$0.00'}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <ReceiptIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processed Count</p>
              <p className="text-xl font-bold text-gray-900">{total} Receipts</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Top Category</p>
              <p className="text-xl font-bold text-gray-900">{stats?.category_breakdown[0]?.category || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search merchant..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="biz" 
                checked={!!filters.isBusiness}
                onChange={(e) => handleFilterChange('isBusiness', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
              />
              <label htmlFor="biz" className="text-sm font-medium text-gray-700">Business Only</label>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="bg-white rounded-xl py-20 text-center border-2 border-dashed border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No receipts found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {receipts.map((receipt) => (
              <div 
                key={receipt.id}
                onClick={() => navigate(`/receipts/${receipt.id}`)}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                  {receipt.document?.file_path ? (
                    <img 
                      src={receipt.document.file_path} 
                      alt={receipt.merchant_name || 'Receipt'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ReceiptIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded bg-white/90 backdrop-blur shadow-sm ${receipt.is_business_expense ? 'text-indigo-600' : 'text-gray-600'}`}>
                      {receipt.is_business_expense ? 'Business' : 'Personal'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate flex-1">{receipt.merchant_name || 'Unidentified Merchant'}</h3>
                    <p className="text-indigo-600 font-bold ml-2">{formatCurrency(receipt.total_amount, receipt.currency)}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(receipt.purchase_date!).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {receipt.category || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination 
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />
      </div>
    </DashboardLayout>
  );
};

export default ReceiptList;
