import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceApi } from '../../services/documentApi';
import api from '../../services/api';
import type { Invoice } from '../../types/invoice';
import PDFViewer from '../../components/PDFViewer';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  ArrowLeft, Download, Trash2, Pencil, Check, X,
  FileText, Building2, User, StickyNote, Hash,
  Calendar, Clock, DollarSign, Tag
} from 'lucide-react';

type Tab = 'details' | 'lineitems' | 'parties' | 'notes';

/* ── helpers ── */
const formatCurrency = (amount: number | null | undefined, currency: string) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
};

const formatDate = (ds: string | null | undefined) => {
  if (!ds) return '—';
  return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const statusConfig = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':     return { label: 'Paid',     cls: 'bg-green-400/10 text-green-400 border-green-400/20' };
    case 'unpaid':   return { label: 'Unpaid',   cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' };
    case 'overdue':  return { label: 'Overdue',  cls: 'bg-red-400/10 text-red-400 border-red-400/20' };
    case 'partial':  return { label: 'Partial',  cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20' };
    default:         return { label: 'Pending',  cls: 'bg-[#111111] text-[#888888] border-[#1A1A1A]' };
  }
};

/* ── shared input style ── */
const inputCls =
  'w-full px-3 py-2 bg-black border border-[#1A1A1A] rounded-lg text-sm text-white ' +
  'placeholder-[#333333] focus:outline-none focus:border-white/20 transition-colors';
const textareaCls = inputCls + ' resize-none';

/* ── field display row ── */
const Field: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
  label, value, icon,
}) => (
  <div className="flex items-start gap-3 p-4 bg-black border border-[#0F0F0F] rounded-lg hover:border-white/10 transition-all">
    {icon && <div className="w-4 h-4 text-[#444444] mt-0.5 flex-shrink-0">{icon}</div>}
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold text-[#333333] uppercase tracking-widest">{label}</p>
      <p className="text-sm text-white mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Partial<Invoice>>({});
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const blobUrlRef = useRef<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (id) fetchInvoice(); }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceApi.getInvoiceById(id!);
      const data: Invoice = response.data;
      setInvoice(data);
      setEditedInvoice(data);

      if (data.document?.id) {
        try {
          const docRes = await api.get(`/api/documents/${data.document.id}/download`, { responseType: 'blob' });
          const blob = URL.createObjectURL(docRes.data);
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = blob;
          setDocumentBlobUrl(blob);
        } catch { /* preview unavailable */ }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load invoice', 'error');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await invoiceApi.updateInvoice(id!, editedInvoice);
      showToast('Invoice updated', 'success');
      setEditing(false);
      fetchInvoice();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedInvoice(invoice || {});
    setEditing(false);
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    if (!id || updatingStatus) return;
    setShowStatusMenu(false);
    try {
      setUpdatingStatus(true);
      await invoiceApi.updateInvoice(id, { status: newStatus as Invoice['status'] });
      showToast(`Status updated to ${newStatus}`, 'success');
      fetchInvoice();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Close status menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await invoiceApi.deleteInvoice(id!);
      showToast('Invoice deleted', 'success');
      navigate('/invoices');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleDownload = async () => {
    if (!invoice?.document?.id || !invoice?.document?.original_filename) {
      showToast('No document available', 'error'); return;
    }
    try {
      const docRes = await api.get(`/api/documents/${invoice.document.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(docRes.data);
      const a = document.createElement('a');
      a.href = url; a.download = invoice.document.original_filename; a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Download failed', 'error');
    }
  };

  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  /* ── loading ── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A0A0A0]" />
        </div>
      </DashboardLayout>
    );
  }
  if (!invoice) return null;

  const status = statusConfig(invoice.status);
  const lineItems = invoice.line_items ?? [];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'details',   label: 'Details',   icon: <Hash     className="w-3.5 h-3.5" /> },
    { key: 'lineitems', label: 'Line Items', icon: <Tag      className="w-3.5 h-3.5" /> },
    { key: 'parties',   label: 'Parties',   icon: <Building2 className="w-3.5 h-3.5" /> },
    { key: 'notes',     label: 'Notes',     icon: <StickyNote className="w-3.5 h-3.5" /> },
  ];

  /* ── edit helpers ── */
  const set = (key: keyof Invoice, value: any) =>
    setEditedInvoice((prev) => ({ ...prev, [key]: value }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Back nav ── */}
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-[#555555] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Invoices
        </button>

        {/* ── Hero card ── */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-xl p-6 hover:border-white/10 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Icon */}
            <div className="w-16 h-16 rounded-xl bg-[#111111] border border-[#1A1A1A] flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-[#444444]" />
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {invoice.invoice_number ? `Invoice ${invoice.invoice_number}` : 'Invoice'}
                </h1>

                {/* Quick-status pill (clickable) */}
                <div className="relative" ref={statusMenuRef}>
                  <button
                    onClick={() => !editing && setShowStatusMenu((v) => !v)}
                    disabled={updatingStatus || editing}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border transition-all ${
                      editing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'
                    } ${status.cls}`}
                    title={editing ? 'Exit edit mode to change status quickly' : 'Click to change status'}
                  >
                    {updatingStatus ? (
                      <span className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      status.label
                    )}
                    {!editing && <span className="opacity-60">▾</span>}
                  </button>

                  {showStatusMenu && (
                    <div className="absolute top-full mt-1.5 left-0 z-50 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
                      {([
                        { value: 'pending', label: 'Pending',  cls: 'text-[#888888]' },
                        { value: 'paid',    label: 'Paid',     cls: 'text-green-400' },
                        { value: 'unpaid',  label: 'Unpaid',   cls: 'text-yellow-400' },
                        { value: 'overdue', label: 'Overdue',  cls: 'text-red-400' },
                        { value: 'partial', label: 'Partial',  cls: 'text-blue-400' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleQuickStatusChange(opt.value)}
                          className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/5 ${
                            invoice.status === opt.value ? 'bg-white/5 ' + opt.cls : opt.cls
                          }`}
                        >
                          {invoice.status === opt.value && <span className="mr-1.5">✓</span>}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#555555] mt-1">{invoice.vendor_name || 'Unknown vendor'}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {invoice.invoice_date && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#444444]">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(invoice.invoice_date)}
                  </span>
                )}
                {invoice.due_date && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#444444]">
                    <Clock className="w-3.5 h-3.5" /> Due {formatDate(invoice.due_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Total amount */}
            <div className="flex-shrink-0 text-right">
              <p className="text-[9px] font-bold text-[#333333] uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(invoice.total_amount, invoice.currency)}
              </p>
              {invoice.currency && invoice.currency !== 'USD' && (
                <p className="text-[10px] text-[#444444] mt-0.5">{invoice.currency}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black bg-white rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888888] bg-black border border-[#1A1A1A] rounded-lg hover:border-white/20 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888888] bg-black border border-[#1A1A1A] rounded-lg hover:border-white/20 hover:text-white transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888888] bg-black border border-[#1A1A1A] rounded-lg hover:border-white/20 hover:text-white transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#111111]">
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-lg font-bold text-white">{formatCurrency(invoice.subtotal, invoice.currency)}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Subtotal</p>
            </div>
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-lg font-bold text-white">{formatCurrency(invoice.tax, invoice.currency)}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Tax</p>
            </div>
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              <p className="text-lg font-bold text-white">{lineItems.length}</p>
              <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Line Items</p>
            </div>
            <div className="bg-black border border-[#0F0F0F] rounded-lg p-4 text-center hover:border-white/10 transition-all">
              {invoice.confidence_score != null ? (
                <>
                  <p className="text-lg font-bold text-white">{Math.round(invoice.confidence_score * 100)}%</p>
                  <p className="text-[9px] text-[#333333] uppercase font-bold tracking-widest mt-1">Confidence</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-[#333333]">—</p>
                  <p className="text-[9px] text-[#222222] uppercase font-bold tracking-widest mt-1">Confidence</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Main grid: tabbed content left + PDF right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — tabbed panel */}
          <div className="lg:col-span-3 space-y-0">

            {/* Tab bar */}
            <div className="flex gap-1 bg-[#0A0A0A] border border-[#111111] rounded-xl p-1 mb-4">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                    activeTab === t.key
                      ? 'bg-white text-black'
                      : 'text-[#444444] hover:text-[#888888]'
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-[#0A0A0A] border border-[#111111] rounded-xl p-6 hover:border-white/10 transition-all duration-300 min-h-[400px]">

              {/* ── DETAILS ── */}
              {activeTab === 'details' && (
                <div className="space-y-5">
                  <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em]">Invoice Details</p>

                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Invoice Number</label>
                        <input className={inputCls} value={editedInvoice.invoice_number || ''} onChange={(e) => set('invoice_number', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Invoice Date</label>
                          <input type="date" className={inputCls} value={(editedInvoice.invoice_date || '').split('T')[0]} onChange={(e) => set('invoice_date', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Due Date</label>
                          <input type="date" className={inputCls} value={(editedInvoice.due_date || '').split('T')[0]} onChange={(e) => set('due_date', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Status</label>
                        <select className={inputCls} value={editedInvoice.status || ''} onChange={(e) => set('status', e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                          <option value="overdue">Overdue</option>
                          <option value="partial">Partial</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Payment Terms</label>
                        <input className={inputCls} value={editedInvoice.payment_terms || ''} onChange={(e) => set('payment_terms', e.target.value)} placeholder="e.g. Net 30" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Field label="Invoice Number" value={invoice.invoice_number} icon={<Hash className="w-4 h-4" />} />
                      <div className="grid grid-cols-2 gap-2.5">
                        <Field label="Invoice Date" value={formatDate(invoice.invoice_date)} icon={<Calendar className="w-4 h-4" />} />
                        <Field label="Due Date" value={formatDate(invoice.due_date)} icon={<Clock className="w-4 h-4" />} />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex items-start gap-3 p-4 bg-black border border-[#0F0F0F] rounded-lg hover:border-white/10 transition-all">
                          <DollarSign className="w-4 h-4 text-[#444444] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[9px] font-bold text-[#333333] uppercase tracking-widest">Status</p>
                            <span className={`inline-block mt-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded border ${status.cls}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                        <Field label="Payment Terms" value={invoice.payment_terms} icon={<Tag className="w-4 h-4" />} />
                      </div>
                      {invoice.validation_status && (
                        <Field label="Validation" value={invoice.validation_status} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── LINE ITEMS ── */}
              {activeTab === 'lineitems' && (
                <div>
                  <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-5">Line Items</p>
                  {lineItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Tag className="w-8 h-8 text-[#222222]" />
                      <p className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">No line items</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-[#0F0F0F]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#111111]">
                            {['Description', 'Qty', 'Unit Price', 'Amount'].map((h, i) => (
                              <th key={i} className={`px-4 py-3 text-[9px] font-bold text-[#333333] uppercase tracking-widest bg-black ${i > 0 ? 'text-right' : 'text-left'}`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, i) => (
                            <tr key={i} className="border-b border-[#0A0A0A] hover:bg-black/40 transition-colors last:border-0">
                              <td className="px-4 py-3 text-[#888888]">{item.description}</td>
                              <td className="px-4 py-3 text-[#888888] text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-[#888888] text-right">{formatCurrency(item.unit_price, invoice.currency)}</td>
                              <td className="px-4 py-3 text-white font-medium text-right">{formatCurrency(item.amount, invoice.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-[#1A1A1A]">
                            <td colSpan={3} className="px-4 py-3 text-[9px] font-bold text-[#333333] uppercase tracking-widest text-right bg-black">Total</td>
                            <td className="px-4 py-3 text-white font-bold text-right bg-black">
                              {formatCurrency(invoice.total_amount, invoice.currency)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── PARTIES ── */}
              {activeTab === 'parties' && (
                <div className="space-y-6">
                  {/* Vendor */}
                  <div>
                    <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" /> Vendor
                    </p>
                    {editing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Name</label>
                          <input className={inputCls} value={editedInvoice.vendor_name || ''} onChange={(e) => set('vendor_name', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Address</label>
                          <textarea rows={3} className={textareaCls} value={editedInvoice.vendor_address || ''} onChange={(e) => set('vendor_address', e.target.value)} />
                        </div>
                        {invoice.vendor_email !== undefined && (
                          <div>
                            <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Email</label>
                            <input className={inputCls} value={editedInvoice.vendor_email || ''} onChange={(e) => set('vendor_email', e.target.value)} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Field label="Name" value={invoice.vendor_name} icon={<Building2 className="w-4 h-4" />} />
                        {invoice.vendor_address && <Field label="Address" value={invoice.vendor_address} />}
                        {invoice.vendor_email  && <Field label="Email"   value={invoice.vendor_email} />}
                        {invoice.vendor_tax_id && <Field label="Tax ID"  value={invoice.vendor_tax_id} />}
                      </div>
                    )}
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Customer
                    </p>
                    {editing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Name</label>
                          <input className={inputCls} value={editedInvoice.customer_name || ''} onChange={(e) => set('customer_name', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#333333] uppercase tracking-widest block mb-1.5">Address</label>
                          <textarea rows={3} className={textareaCls} value={editedInvoice.customer_address || ''} onChange={(e) => set('customer_address', e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Field label="Name"    value={invoice.customer_name}    icon={<User className="w-4 h-4" />} />
                        {invoice.customer_address && <Field label="Address" value={invoice.customer_address} />}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── NOTES ── */}
              {activeTab === 'notes' && (
                <div>
                  <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-4">Notes</p>
                  {editing ? (
                    <textarea
                      rows={10}
                      className={textareaCls}
                      value={editedInvoice.notes || ''}
                      onChange={(e) => set('notes', e.target.value)}
                      placeholder="Add notes or comments about this invoice…"
                    />
                  ) : invoice.notes ? (
                    <p className="text-sm text-[#888888] leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <StickyNote className="w-8 h-8 text-[#222222]" />
                      <p className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">No notes</p>
                      {!editing && (
                        <button
                          onClick={() => setEditing(true)}
                          className="text-[10px] font-bold text-[#444444] hover:text-white uppercase tracking-widest transition-colors"
                        >
                          + Add a note
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — sticky PDF preview */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              {documentBlobUrl && invoice.document ? (
                <PDFViewer fileUrl={documentBlobUrl} filename={invoice.document.original_filename} />
              ) : (
                <div className="bg-[#0A0A0A] border border-[#111111] rounded-xl aspect-[3/4] flex flex-col items-center justify-center gap-4 hover:border-white/10 transition-all duration-300">
                  <div className="w-14 h-14 flex items-center justify-center bg-black border border-[#1A1A1A] rounded-xl">
                    <FileText className="w-6 h-6 text-[#333333]" />
                  </div>
                  <p className="text-[10px] font-bold text-[#2A2A2A] uppercase tracking-widest">
                    {invoice.document ? 'Processing preview…' : 'No document'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete modal ── */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Invoice">
        <div className="space-y-4">
          <p className="text-sm text-[#888888]">
            Are you sure you want to delete{' '}
            <span className="text-white font-semibold">
              {invoice.invoice_number ? `Invoice ${invoice.invoice_number}` : 'this invoice'}
            </span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888888] border border-[#1A1A1A] rounded-lg hover:bg-[#111111] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default InvoiceDetail;
