import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  FileText,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  Tag,
  Printer,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { VaultDocument, DocumentCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from '../components/PermissionGate';

const CATEGORIES: { key: DocumentCategory; label: string; countColor: string }[] = [
  { key: 'COMMERCIAL', label: 'Commercial & Origin', countColor: 'bg-blue-100 text-blue-700' },
  { key: 'TRANSPORT', label: 'Transport & B/L', countColor: 'bg-purple-100 text-purple-700' },
  { key: 'CUSTOMS_REGULATORY', label: 'Customs & Regulatory', countColor: 'bg-emerald-100 text-emerald-700' },
  { key: 'BANKING_FINANCE', label: 'Banking & Remittance', countColor: 'bg-teal-100 text-teal-700' },
];

export const DocumentVaultPage: React.FC = () => {
  const { user, can } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    shipment_no: 'AEC/1001/2026-27',
    category: 'COMMERCIAL' as DocumentCategory,
    doc_title: '',
    file_name: '',
    tags: 'Invoice, Origin',
  });

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getVaultDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load vault documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      await apiClient.verifyVaultDocument(id, user.name);
      await loadDocuments();
    } catch (err: any) {
      alert('Failed to verify document: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete document from vault?')) return;
    try {
      await apiClient.deleteVaultDocument(id);
      await loadDocuments();
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.doc_title) {
      alert('Please enter document title');
      return;
    }
    try {
      const tagsArray = uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      await apiClient.uploadVaultDocument({
        shipment_no: uploadForm.shipment_no,
        category: uploadForm.category,
        doc_title: uploadForm.doc_title,
        file_name: uploadForm.file_name || `${uploadForm.doc_title.replace(/\s+/g, '_')}.pdf`,
        uploaded_by: user.name,
        tags: tagsArray,
      });
      setShowUploadModal(false);
      setUploadForm({
        shipment_no: 'AEC/1001/2026-27',
        category: 'COMMERCIAL',
        doc_title: '',
        file_name: '',
        tags: 'Invoice, Origin',
      });
      await loadDocuments();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };

  const filtered = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch =
      doc.doc_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shipment_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1 font-mono uppercase tracking-wider">
            <FolderArchive className="w-4 h-4" />
            <span>Digital Vault & Customs Compliance Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Shipment Document E-Vault</h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure digital repository for Commercial Invoices, Bills of Lading, COO Form A, CUSDEC entries, SLSI test permits, and Colombo bank documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier Manifest</span>
          </button>

          <PermissionGate permission="documents:upload">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#091E42] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Files ({documents.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = documents.filter(d => d.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-[#091E42] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${cat.countColor}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            Accessing secure digital document repository...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No matching documents found in the vault.
          </div>
        ) : (
          filtered.map(doc => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {doc.shipment_no}
                  </span>

                  {doc.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-800 mt-2 line-clamp-2" title={doc.doc_title}>
                  {doc.doc_title}
                </h3>

                <div className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                  {doc.file_name} &bull; {doc.file_size_kb} KB
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {doc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-400">
                  By: {doc.uploaded_by}
                </div>

                <div className="flex items-center gap-1.5">
                  {!doc.is_verified && (
                    <button
                      onClick={() => handleVerify(doc.id)}
                      title="Verify Document"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => alert(`Opening preview for ${doc.file_name}`)}
                    title="Preview Document"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Delete Document"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Upload to Shipment Vault</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Shipment Reference</label>
                <input
                  type="text"
                  value={uploadForm.shipment_no}
                  onChange={e => setUploadForm({ ...uploadForm, shipment_no: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Document Category</label>
                <select
                  value={uploadForm.category}
                  onChange={e => setUploadForm({ ...uploadForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="COMMERCIAL">Commercial & Origin (Invoices, COO)</option>
                  <option value="TRANSPORT">Transport & Maritime (Bill of Lading)</option>
                  <option value="CUSTOMS_REGULATORY">Customs & Regulatory (CUSDEC, SLSI)</option>
                  <option value="BANKING_FINANCE">Banking & Remittance (Swift, LC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Fumigation Certificate - Tuticorin Port"
                  value={uploadForm.doc_title}
                  onChange={e => setUploadForm({ ...uploadForm, doc_title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Fumigation, Agriculture, Phyto"
                  value={uploadForm.tags}
                  onChange={e => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
                <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                <span className="text-slate-600 font-semibold block text-xs">Simulated PDF / Document Attachment</span>
                <span className="text-[10px] text-slate-400">PDF, PNG, Excel supported up to 25MB</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save into Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
