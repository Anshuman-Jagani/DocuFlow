import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptApi } from '../../services/documentApi';
import type { Receipt } from '../../types/receipt';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import Modal from '../../components/ui/Modal';

const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReceipt();
    }
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await receiptApi.getReceiptById(id!);
      setReceipt(response.data);
    } catch (error: any) {
      showToast('Failed to fetch receipt details', 'error');
      navigate('/receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await receiptApi.deleteReceipt(id!);
      showToast('Receipt deleted successfully', 'success');
      navigate('/receipts');
    } catch (error) {
      showToast('Failed to delete receipt', 'error');
    }
  };

  const handleDownload = async () => {
    if (!receipt?.document?.id || !receipt?.document?.original_filename) {
      showToast('No document available for download', 'error');
      return;
    }
    
    try {
      // Need to import documentService or use receiptApi if it has a download method.
      // Since documentService has a generic download, I'll use that.
      const documentService = (await import('../../services/documentService')).default;
      await documentService.downloadDocument(receipt.document.id, receipt.document.original_filename);
      showToast('Receipt downloaded successfully', 'success');
    } catch (error: any) {
      showToast('Failed to download receipt', 'error');
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
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

  if (!receipt) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <button 
          onClick={() => navigate('/receipts')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </button>
 
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{receipt.merchant_name || 'Merchant Unidentified'}</h1>
              <p className="text-gray-500">{new Date(receipt.purchase_date!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm"
              title="Download Scan"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-400 hover:text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-tighter">Transaction Details</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${receipt.is_business_expense ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                    {receipt.is_business_expense ? 'Business' : 'Personal'}
                  </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Method</p>
                  <p className="text-sm font-bold text-gray-900">{receipt.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">Category</p>
                  <p className="text-sm font-bold text-gray-900">{receipt.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tax</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(receipt.tax ?? null, receipt.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-400 mb-1">Total</p>
                  <p className="text-xl font-black text-indigo-600">{formatCurrency(receipt.total_amount, receipt.currency)}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Itemized Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Item</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receipt.items && receipt.items.length > 0 ? (
                      receipt.items.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-center">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatCurrency(item.unit_price, receipt.currency)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(item.amount, receipt.currency)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400 italic">No item data extracted</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50/50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-500">Subtotal</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(receipt.subtotal ?? null, receipt.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Digital Scan</h3>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="p-4 bg-gray-50">
                {receipt.document?.file_path ? (
                  <img 
                    src={receipt.document.file_path} 
                    alt="Receipt Scan" 
                    className="w-full rounded-lg shadow-inner border border-gray-200"
                  />
                ) : (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center text-gray-300 gap-2 italic">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-xs">Image unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Receipt">
          <div className="space-y-4 pt-2">
            <p className="text-gray-500 text-sm">Are you sure you want to remove this record? This will delete the extracted data and the attached scan.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ReceiptDetail;
