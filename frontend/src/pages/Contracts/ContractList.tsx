import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractApi } from '../../services/documentApi';
import type { Contract, ContractFilters, ContractSortField } from '../../types/contract';
import type { SortOrder } from '../../types/invoice';
import Pagination from '../../components/Pagination';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const inputClass = 'w-full px-3 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors text-sm';
const labelClass = 'block text-[10px] font-bold text-[#444444] uppercase tracking-widest mb-1';

const ContractList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState<ContractSortField>('expiration_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filters, setFilters] = useState<ContractFilters>({ search: '', type: '', status: '', risk: '' });

  useEffect(() => { fetchContracts(); }, [page, limit, sortField, sortOrder, filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractApi.getContracts(filters, page, limit, sortField, sortOrder);
      setContracts(response.data || []);
      setTotal(response.meta?.pagination?.total || 0);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch contracts', 'error');
    } finally { setLoading(false); }
  };

  const handleSort = (field: ContractSortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };
  const handleFilterChange = (key: keyof ContractFilters, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
  const clearFilters = () => { setFilters({ search: '', type: '', status: '', risk: '' }); setPage(1); };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (contract: Contract) => {
    const now = new Date();
    const expiry = contract.expiration_date ? new Date(contract.expiration_date) : null;
    let label = 'ACTIVE'; let style = 'bg-success/10 text-success border-success/20';
    if (expiry) {
      const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days < 0) { label = 'EXPIRED'; style = 'bg-danger/10 text-danger border-danger/20'; }
      else if (days <= 30) { label = 'EXPIRING SOON'; style = 'bg-warning/10 text-warning border-warning/20'; }
    }
    if (contract.requires_legal_review) { label = 'UNDER REVIEW'; style = 'bg-white/10 text-white border-white/20'; }
    return <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${style}`}>{label}</span>;
  };

  const getRiskBadge = (score: number | null) => {
    if (score === null) return <span className="text-[#444444] text-xs">N/A</span>;
    const bar = score > 70 ? 'bg-danger' : score > 40 ? 'bg-warning' : 'bg-success';
    const text = score > 70 ? 'text-danger' : score > 40 ? 'text-warning' : 'text-success';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-[#1A1A1A] rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-xs font-bold ${text}`}>{score}%</span>
      </div>
    );
  };

  const SortIcon = ({ field }: { field: ContractSortField }) => {
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
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Contracts</h1>
          <p className="mt-1 text-sm text-[#444444]">Monitor contract durations, renewal dates, and risk assessments.</p>
        </div>

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass}>Search</label>
              <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Contract title or parties..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className={inputClass.replace('placeholder-[#5A5A5A]', '')}>
                <option value="">All Types</option>
                <option value="Service">Service Agreement</option>
                <option value="Employment">Employment</option>
                <option value="NDA">NDA</option>
                <option value="SaaS">SaaS License</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Risk Level</label>
              <select value={filters.risk} onChange={(e) => handleFilterChange('risk', e.target.value)} className={inputClass.replace('placeholder-[#5A5A5A]', '')}>
                <option value="">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-[#444444] bg-black border border-[#111111] rounded-lg hover:text-white hover:border-[#5A5A5A] transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0A0A0]" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#444444]">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-white">No contracts found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black border-b border-[#111111]">
                    <tr>
                      {[
                        { f: 'contract_title', label: 'Contract Title' },
                        { f: 'contract_type', label: 'Type' },
                      ].map(({ f, label }) => (
                        <th key={f} onClick={() => handleSort(f as ContractSortField)}
                          className="px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest cursor-pointer hover:text-[#888888] transition-colors">
                          <div className="flex items-center gap-2">{label}<SortIcon field={f as ContractSortField} /></div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest">Parties</th>
                      {[
                        { f: 'expiration_date', label: 'Expiry Date' },
                        { f: 'risk_score', label: 'Risk Score' },
                      ].map(({ f, label }) => (
                        <th key={f} onClick={() => handleSort(f as ContractSortField)}
                          className="px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest cursor-pointer hover:text-[#888888] transition-colors">
                          <div className="flex items-center gap-2">{label}<SortIcon field={f as ContractSortField} /></div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold text-[#444444] uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0F0F0F]">
                    {contracts.map((contract) => (
                      <tr key={contract.id} onClick={() => navigate(`/contracts/${contract.id}`)}
                        className="hover:bg-[#111111] cursor-pointer transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{contract.contract_title || 'Untitled Contract'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#888888]">{contract.contract_type || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444444]">
                          {contract.parties.slice(0, 2).map(p => p.name).join(' & ')}
                          {contract.parties.length > 2 && ' ...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444444]">{formatDate(contract.expiration_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getRiskBadge(contract.risk_score)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contract)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${contract.id}`); }}
                            className="text-[#888888] hover:text-white transition-colors font-bold uppercase tracking-wider text-xs">
                            Analyze
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

export default ContractList;
