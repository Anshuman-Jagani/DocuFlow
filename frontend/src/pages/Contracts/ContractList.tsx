import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractApi } from '../../services/documentApi';
import type { Contract, ContractFilters, ContractSortField } from '../../types/contract';
import type { SortOrder } from '../../types/invoice';
import Pagination from '../../components/Pagination';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

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
  
  const [filters, setFilters] = useState<ContractFilters>({
    search: '',
    type: '',
    status: '',
    risk: '',
  });

  useEffect(() => {
    fetchContracts();
  }, [page, limit, sortField, sortOrder, filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractApi.getContracts(filters, page, limit, sortField, sortOrder);
      setContracts(response.data || []);
      setTotal(response.meta?.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      showToast(error.response?.data?.message || 'Failed to fetch contracts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: ContractSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (key: keyof ContractFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      risk: '',
    });
    setPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (contract: Contract) => {
    const now = new Date();
    const expiry = contract.expiration_date ? new Date(contract.expiration_date) : null;
    
    let status = 'active';
    let colorClass = 'bg-green-100 text-green-800';
    
    if (expiry) {
      const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry < 0) {
        status = 'expired';
        colorClass = 'bg-red-100 text-red-800';
      } else if (daysToExpiry <= 30) {
        status = 'expiring soon';
        colorClass = 'bg-yellow-100 text-yellow-800';
      }
    }
    
    if (contract.requires_legal_review) {
      status = 'under review';
      colorClass = 'bg-blue-100 text-blue-800';
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (score: number | null) => {
    if (score === null) return <span className="text-gray-400">N/A</span>;
    
    let colorClass = 'text-green-600';
    if (score > 70) colorClass = 'text-red-600';
    else if (score > 40) colorClass = 'text-yellow-600';
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${score > 70 ? 'bg-red-600' : score > 40 ? 'bg-yellow-600' : 'bg-green-600'}`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className={`text-xs font-bold ${colorClass}`}>{score}%</span>
      </div>
    );
  };

  const SortIcon = ({ field }: { field: ContractSortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor contract durations, renewal dates, and risk assessments.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Contract title or parties..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Service">Service Agreement</option>
                <option value="Employment">Employment</option>
                <option value="NDA">NDA</option>
                <option value="SaaS">SaaS License</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select
                value={filters.risk}
                onChange={(e) => handleFilterChange('risk', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No contracts found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th
                        onClick={() => handleSort('contract_title')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">Contract Title <SortIcon field="contract_title" /></div>
                      </th>
                      <th
                        onClick={() => handleSort('contract_type')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">Type <SortIcon field="contract_type" /></div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties</th>
                      <th
                        onClick={() => handleSort('expiration_date')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">Expiry Date <SortIcon field="expiration_date" /></div>
                      </th>
                      <th
                        onClick={() => handleSort('risk_score')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">Risk Score <SortIcon field="risk_score" /></div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr
                        key={contract.id}
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.contract_title || 'Untitled Contract'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contract.contract_type || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contract.parties.slice(0, 2).map(p => p.name).join(' & ')}
                          {contract.parties.length > 2 && ' ...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(contract.expiration_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getRiskBadge(contract.risk_score)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contract) }</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}`);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractList;
