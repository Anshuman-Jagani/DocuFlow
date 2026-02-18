import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceApi } from '../services/documentApi';
import api from '../services/api';
import type { Invoice } from '../types/invoice';
import PDFViewer from '../components/PDFViewer';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import DashboardLayout from '../components/layout/DashboardLayout';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Partial<Invoice>>({});
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceApi.getInvoiceById(id!);
      const invoiceData: Invoice = response.data;
      setInvoice(invoiceData);
      setEditedInvoice(invoiceData);

      // Fetch document as blob for preview (iframe can't send auth headers)
      if (invoiceData.document?.id) {
        try {
          const docResponse = await api.get(`/api/documents/${invoiceData.document.id}/download`, {
            responseType: 'blob',
          });
          const blobUrl = URL.createObjectURL(docResponse.data);
          // Revoke previous blob URL if any
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          blobUrlRef.current = blobUrl;
          setDocumentBlobUrl(blobUrl);
        } catch {
          // Document preview unavailable, silently ignore
        }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch invoice', 'error');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      await invoiceApi.updateInvoice(id!, editedInvoice);
      showToast('Invoice updated successfully', 'success');
      setEditing(false);
      fetchInvoice();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update invoice', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await invoiceApi.deleteInvoice(id!);
      showToast('Invoice deleted successfully', 'success');
      navigate('/invoices');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete invoice', 'error');
    }
  };

  const handleCancel = () => {
    setEditedInvoice(invoice || {});
    setEditing(false);
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!invoice) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {invoice.vendor_name || 'Unknown Vendor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-1">
          {documentBlobUrl && invoice.document ? (
            <PDFViewer
              fileUrl={documentBlobUrl}
              filename={invoice.document.original_filename}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">{invoice.document ? 'Loading preview...' : 'No document available'}</p>
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedInvoice.invoice_number || ''}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{invoice.invoice_number || 'N/A'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={editedInvoice.invoice_date?.split('T')[0] || ''}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, invoice_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formatDate(invoice.invoice_date)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={editedInvoice.due_date?.split('T')[0] || ''}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                {editing ? (
                  <select
                    value={editedInvoice.status || ''}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                    <option value="partial">Partial</option>
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editedInvoice.vendor_name || ''}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, vendor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{invoice.vendor_name || 'Unknown Vendor'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Address
                </label>
                {editing ? (
                  <textarea
                    value={editedInvoice.vendor_address || ''}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, vendor_address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{invoice.vendor_address || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {(invoice.customer_name || editing) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedInvoice.customer_name || ''}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, customer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{invoice.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Address
                  </label>
                  {editing ? (
                    <textarea
                      value={editedInvoice.customer_address || ''}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, customer_address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{invoice.customer_address || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Amount Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amount Details</h2>
            
            <div className="space-y-3">
              {invoice.subtotal && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>
              )}

              {invoice.tax && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.tax, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total Amount</span>
                <span className="text-base font-bold text-indigo-600">
                  {formatCurrency(invoice.total_amount, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.line_items && invoice.line_items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.line_items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unit_price, invoice.currency)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {(invoice.notes || editing) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              {editing ? (
                <textarea
                  value={editedInvoice.notes || ''}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add notes..."
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this invoice? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </DashboardLayout>
  );
};

export default InvoiceDetail;
