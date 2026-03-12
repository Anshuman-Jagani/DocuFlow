import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptApi } from '../../services/documentApi';
import type { Receipt } from '../../types/receipt';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, CreditCard, CheckCircle2, AlertCircle, Download, ShoppingBag, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => { if (id) fetchReceipt(); }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await receiptApi.getReceiptById(id!);
      setReceipt(response.data);
    } catch {
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
    } catch { showToast('Failed to delete receipt', 'error'); }
  };

  const handleDownload = async () => {
    if (!receipt?.document?.id || !receipt?.document?.original_filename) {
      showToast('No document available for download', 'error');
      return;
    }
    try {
      const documentService = (await import('../../services/documentService')).default;
      await documentService.downloadDocument(receipt.document.id, receipt.document.original_filename);
      showToast('Receipt downloaded successfully', 'success');
    } catch { showToast('Failed to download receipt', 'error'); }
  };

  const formatCurrency = (amount: number | null, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount || 0);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0A0A0]" />
      </div>
    </DashboardLayout>
  );
  if (!receipt) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => navigate('/receipts')}
          className="flex items-center gap-2 text-[#444444] hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Receipts
        </button>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#0A0A0A] border border-[#111111] rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{receipt.merchant_name || 'Merchant Unidentified'}</h1>
              <p className="text-[#444444]">{new Date(receipt.purchase_date!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownload}
              className="p-2 text-[#444444] hover:text-white bg-[#0A0A0A] border border-[#111111] rounded-lg hover:bg-[#111111] transition-colors" title="Download Scan">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={() => setShowDeleteModal(true)}
              className="p-2 text-danger hover:text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Summary */}
            <div className="bg-[#0A0A0A] border border-[#111111] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#111111] flex justify-between items-center bg-black">
                <span className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">Transaction Details</span>
                <span className={`px-2 py-1 rounded text-xs font-bold border ${receipt.is_business_expense ? 'bg-white/10 text-white border-white/20' : 'bg-[#1A1A1A] text-[#444444] border-[#111111]'}`}>
                  {receipt.is_business_expense ? 'Business' : 'Personal'}
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-[#444444] mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Method</p>
                  <p className="text-sm font-bold text-white">{receipt.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#444444] mb-1">Category</p>
                  <p className="text-sm font-bold text-white">{receipt.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#444444] mb-1">Tax</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(receipt.tax ?? null, receipt.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#444444] mb-1">Total</p>
                  <p className="text-xl font-black text-white">{formatCurrency(receipt.total_amount, receipt.currency)}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-[#0A0A0A] border border-[#111111] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#111111]">
                <h3 className="font-bold text-white">Itemized Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest">Item</th>
                      <th className="px-6 py-3 text-center text-[10px] font-bold text-[#444444] uppercase tracking-widest">Qty</th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold text-[#444444] uppercase tracking-widest">Price</th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold text-[#444444] uppercase tracking-widest">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0F0F0F]">
                    {receipt.items && receipt.items.length > 0 ? (
                      receipt.items.map((item, i) => (
                        <tr key={i} className="hover:bg-[#111111] transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-white">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-[#444444] text-center">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm text-[#444444] text-right">{formatCurrency(item.unit_price, receipt.currency)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-white text-right">{formatCurrency(item.amount, receipt.currency)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-[#444444] italic">No item data extracted</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-black">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-[#444444]">Subtotal</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-white">{formatCurrency(receipt.subtotal ?? null, receipt.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="lg:col-span-1">
            <div className="bg-[#0A0A0A] border border-[#111111] rounded-2xl overflow-hidden sticky top-6">
              <div className="p-4 border-b border-[#111111] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Digital Scan</h3>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="p-4 bg-black">
                {receipt.document?.file_path ? (
                  <img src={receipt.document.file_path} alt="Receipt Scan"
                    className="w-full rounded-lg border border-[#111111]" />
                ) : (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center text-[#444444] gap-2 italic">
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
            <p className="text-[#444444] text-sm">Are you sure you want to remove this record? This will delete the extracted data and the attached scan.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-bold text-[#444444] border border-[#111111] rounded-lg hover:bg-[#111111] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors">
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
