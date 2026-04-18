import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import documentService from '../services/documentService';
import type { Document } from '../types';
import { FileText, Download, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const documentTypeColors = {
  invoice: 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/30',
  receipt: 'bg-pink-900/40 text-pink-300 border border-pink-500/30',
  resume: 'bg-purple-900/40 text-purple-300 border border-purple-500/30',
  contract: 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/30',
};

const statusColors = {
  pending: 'bg-amber-900/40 text-amber-300 border border-amber-500/30',
  processing: 'bg-blue-900/40 text-blue-300 border border-blue-500/30 animate-pulse',
  completed: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30',
  failed: 'bg-rose-900/40 text-rose-300 border border-rose-500/30',
};

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (filterType !== 'all') params.document_type = filterType;
      if (filterStatus !== 'all') params.processing_status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const { documents: docs, pagination } = await documentService.getDocuments(params);
      setDocuments(docs);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, filterType, filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(id);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentService.downloadDocument(doc.id, doc.original_filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#555555]">Documents</h1>
            <p className="text-[#555555] mt-1">Manage and view all your uploaded documents</p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            variant="primary"
            size="md"
            className="font-bold uppercase tracking-widest"
          >
            Upload Document
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#555555]" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#111111] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-white rounded-lg hover:bg-white transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-[#111111] text-[#555555] rounded-lg hover:bg-[#0A0A0A] transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </form>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#111111]">
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-2">Document Type</label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#111111] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="invoice">Invoices</option>
                  <option value="receipt">Receipts</option>
                  <option value="resume">Resumes</option>
                  <option value="contract">Contracts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-2">Processing Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#111111] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-[#555555]">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-[#555555] mx-auto mb-4" />
              <p className="text-[#555555] text-lg">No documents found</p>
              <p className="text-[#555555] text-sm mt-2">Upload your first document to get started</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A0A0A] border-b border-[#111111]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#555555] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#0A0A0A]">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-[#555555] mr-3" />
                            <div>
                              <p className="text-sm font-medium text-[#555555]">{doc.original_filename}</p>
                              <p className="text-xs text-[#555555]">{doc.mime_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                            documentTypeColors[doc.document_type]
                          )}>
                            {doc.document_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                            statusColors[doc.processing_status]
                          )}>
                            {doc.processing_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#555555]">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#555555]">
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="text-white hover:text-white inline-flex items-center"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(doc.id))}
                            className="text-red-600 hover:text-red-900 inline-flex items-center ml-3"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#111111] flex items-center justify-between">
                  <div className="text-sm text-[#555555]">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-[#111111] rounded-lg hover:bg-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-[#111111] rounded-lg hover:bg-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}