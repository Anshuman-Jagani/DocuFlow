import React, { useState, useEffect } from 'react';
import { receiptApi } from '../../services/documentApi';
import type { ReceiptStats } from '../../types/receipt';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReceiptAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState<ReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months');

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await receiptApi.getReceiptStats();
      setStats(response.data);
    } catch (error) {
      showToast('Failed to fetch spending analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button 
              onClick={() => navigate('/receipts')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Gallery
            </button>
            <h1 className="text-3xl font-black text-gray-900">Expense Analytics</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trend */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Spending Trends</h3>
              </div>
              <select 
                className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded outline-none"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Past Year</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthly_spending || []}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: any) => [formatCurrency(value), 'Spent']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpending)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">Category Breakdown</h3>
            </div>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.category_breakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {stats?.category_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Total</p>
                <p className="text-xl font-black text-gray-900">{formatCurrency(stats?.total_amount || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business vs Personal */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Tax-Deductible vs Personal Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Business</p>
                  <p className="text-2xl font-black text-indigo-600">{formatCurrency(stats?.business_total || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Percentage</p>
                  <p className="text-lg font-bold text-gray-700">
                    {stats?.total_amount ? Math.round(((stats.business_total || 0) / stats.total_amount) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats?.total_amount ? ((stats.business_total || 0) / stats.total_amount) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                AI has identified these expenses as potential business deductions based on merchant category and item details.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Personal Total</p>
                <p className="text-lg font-black text-gray-900">{formatCurrency(stats?.personal_total || 0)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Avg. Receipt</p>
                <p className="text-lg font-black text-gray-900">{formatCurrency(stats?.avg_amount || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceiptAnalytics;
