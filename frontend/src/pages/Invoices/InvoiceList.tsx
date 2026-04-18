import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceApi } from '../../services/documentApi';
import type { Invoice, InvoiceFilters, SortField, SortOrder } from '../../types/invoice';
import Pagination from '../../components/Pagination';
import DateRangePicker from '../../components/DateRangePicker';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const inputClass = 'w-full px-3 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors text-sm';
const labelClass = 'block text-[10px] font-bold text-[#444444] uppercase tracking-widest mb-1';

const STATUS_STYLES: Record<string, string> = {
  paid:    'bg-success/10 text-success border border-success/20',
  unpaid:  'bg-warning/10 text-warning border border-warning/20',
  overdue: 'bg-danger/10 text-danger border border-danger/20',
  partial: 'bg-white/10 text-white border border-white/20',
};

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState<SortField>('invoice_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<InvoiceFilters>({ search: '', status: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: '' });

  useEffect(() => { fetchInvoices(); }, [page, limit, sortField, sortOrder, filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceApi.getInvoices(filters, page, limit, sortField, sortOrder);
      setInvoices(response.data || []);
      setTotal(response.meta?.pagination?.total || 0);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch invoices', 'error');
    } finally { setLoading(false); }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };
  const handleFilterChange = (key: keyof InvoiceFilters, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
  const handleDateChange = (start: string, end: string) => { setFilters(prev => ({ ...prev, dateFrom: start, dateTo: end })); setPage(1); };
  const clearFilters = () => { setFilters({ search: '', status: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: '' }); setPage(1); };
  const handleExport = async () => {
    try { await invoiceApi.exportInvoices(filters); showToast('Invoices exported successfully', 'success'); }
    catch (error: any) { showToast(error.response?.data?.message || 'Failed to export invoices', 'error'); }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[status] || 'bg-[#1A1A1A] text-[#444444] border border-[#111111]'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    const active = sortField === field;
    const col = active ? 'text-[#888888]' : 'text-[#444444]';
    if (!active) return <svg className={`w-4 h-4 ${col}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    return sortOrder === 'asc'
      ? <svg className={`w-4 h-4 ${col}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      : <svg className={`w-4 h-4 ${col}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Invoices</h1>
            <p className="mt-1 text-sm text-[#444444]">Manage and track all your invoices</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[#E0E0E0] transition-all shadow-glow-white-sm/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass}>Search</label>
              <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Invoice number or vendor name..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={inputClass.replace('placeholder-[#5A5A5A]', '')}>
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-[#444444] bg-black border border-[#111111] rounded-lg hover:text-white hover:border-[#5A5A5A] transition-colors">
                Clear Filters
              </button>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Date Range</label>
              <DateRangePicker startDate={filters.dateFrom} endDate={filters.dateTo} onDateChange={handleDateChange} />
            </div>
            <div>
              <label className={labelClass}>Min Amount</label>
              <input type="number" value={filters.minAmount} onChange={(e) => handleFilterChange('minAmount', e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Amount</label>
              <input type="number" value={filters.maxAmount} onChange={(e) => handleFilterChange('maxAmount', e.target.value)} placeholder="No limit" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0A0A0]" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#444444]">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-white">No invoices found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black border-b border-[#111111]">
                    <tr>
                      {[['invoice_number','Invoice #'],['vendor_name','Vendor'],['invoice_date','Invoice Date'],['due_date','Due Date'],['total_amount','Amount'],['status','Status']].map(([f, label]) => (
                        <th key={f} onClick={() => handleSort(f as SortField)}
                          className="px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest cursor-pointer hover:text-[#888888] transition-colors">
                          <div className="flex items-center gap-2">{label}<SortIcon field={f as SortField} /></div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-[10px] font-bold text-[#444444] uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0F0F0F]">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className="hover:bg-[#111111] cursor-pointer transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.invoice_number || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{invoice.vendor_name || 'Unknown Vendor'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444444]">{formatDate(invoice.invoice_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444444]">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatCurrency(invoice.total_amount, invoice.currency)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}
                            className="text-[#888888] hover:text-white transition-colors font-bold uppercase tracking-wider text-xs">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} totalItems={total} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceList;
