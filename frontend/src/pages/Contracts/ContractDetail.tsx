import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractApi } from '../../services/documentApi';
import type { Contract } from '../../types/contract';
import PDFViewer from '../../components/PDFViewer';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await contractApi.getContractById(id!);
      setContract(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch contract', 'error');
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contract?.document?.id || !contract?.document?.original_filename) {
      showToast('No document available for download', 'error');
      return;
    }
    
    try {
      const documentService = (await import('../../services/documentService')).default;
      await documentService.downloadDocument(contract.document.id, contract.document.original_filename);
      showToast('Contract downloaded successfully', 'success');
    } catch (error: any) {
      showToast('Failed to download contract', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await contractApi.deleteContract(id!);
      showToast('Contract deleted successfully', 'success');
      navigate('/contracts');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete contract', 'error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRiskColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score > 70) return 'text-red-600';
    if (score > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contracts')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{contract.contract_title || 'Untitled Contract'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {contract.contract_type || 'General Contract'}
                </span>
                {contract.requires_legal_review && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Requires Legal Review
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Download
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Contract
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-1">
            {contract.document?.file_url ? (
              <PDFViewer fileUrl={contract.document.file_url} filename={contract.document.original_filename} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Document preview unavailable</p>
              </div>
            )}
          </div>

          {/* Analysis Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      strokeDasharray="100, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className={contract.risk_score! > 70 ? 'text-red-600' : contract.risk_score! > 40 ? 'text-yellow-600' : 'text-green-600'}
                      strokeDasharray={`${contract.risk_score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${getRiskColor(contract.risk_score)}`}>{contract.risk_score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall risk score calculated by AI based on clauses, durations, and obligations identified in the document.</p>
                </div>
              </div>
            </div>

            {/* Contract Dates & Parties */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Effective Date</h3>
                  <p className="text-sm font-medium text-gray-900">{formatDate(contract.effective_date)}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expiration Date</h3>
                  <p className="text-sm font-medium text-gray-900">{formatDate(contract.expiration_date)}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parties Involved</h3>
                  <div className="space-y-2">
                    {contract.parties.map((party, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{party.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded uppercase">{party.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Red Flags & Obligations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key AI Insights</h2>
              <div className="space-y-4">
                {contract.red_flags && contract.red_flags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      Red Flags
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {contract.red_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}
                {contract.key_obligations && contract.key_obligations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-600 flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                      Key Obligations
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {contract.key_obligations.map((ob, i) => <li key={i}>{ob}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Summary */}
            {contract.summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{contract.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Contract">
          <div className="space-y-4">
            <p className="text-gray-600">Are you sure you want to delete this contract? This action will permanently remove all analyzed data.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Delete Permanently</button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ContractDetail;
