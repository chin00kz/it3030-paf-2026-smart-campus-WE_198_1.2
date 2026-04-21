import React, { useState, useEffect } from "react";
import { getBulkUploadHistory, deleteBulkBatch, getErrorMessage } from "@/api/resourceApi";
import { 
    X, Trash2, Calendar, FileText, Database, AlertTriangle, 
    Loader, CheckCircle, RefreshCcw, ChevronRight, History
} from "lucide-react";

export default function UploadHistoryModal({ onClose, onDeleteSuccess }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingBatchId, setDeletingBatchId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await getBulkUploadHistory();
            setHistory(data || []);
            setError(null);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBatch = async (batchId, fileName) => {
        if (!window.confirm(`CAUTION: This will permanently delete all resources created during sync "${fileName}". This action cannot be undone. \n\nContinue?`)) {
            return;
        }

        setDeletingBatchId(batchId);
        try {
            await deleteBulkBatch(batchId);
            setSuccessMessage(`Batch "${fileName}" and all associated assets removed.`);
            fetchHistory(); // Refresh history
            onDeleteSuccess(); // Refresh main resource list
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingBatchId(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-white/40 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-8 text-white flex items-center justify-between shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            <History size={24} className="text-emerald-300" /> Upload <span className="text-emerald-200">History</span>
                        </h2>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Batch Session Ledger</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchHistory}
                            disabled={loading}
                            className="bg-white/10 hover:bg-white/40 rounded-xl p-3 text-white transition-all backdrop-blur-md border border-white/20 disabled:opacity-50"
                        >
                            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="bg-white/10 hover:bg-white/40 rounded-xl p-3 text-white transition-all backdrop-blur-md border border-white/20"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10">
                    
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs font-bold text-red-900 leading-relaxed">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                            <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                            <p className="text-xs font-bold text-emerald-900 leading-relaxed">{successMessage}</p>
                        </div>
                    )}

                    {loading && history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader className="animate-spin text-emerald-500" size={40} />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Data Vault...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                                <Database size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">No History Found</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Start a bulk import to see logs here</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm table-fixed">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="w-[40%] px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Session</th>
                                        <th className="w-[20%] px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Batch Size</th>
                                        <th className="w-[25%] px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Timestamp</th>
                                        <th className="w-[15%] px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {history.map((record) => (
                                        <tr key={record.batchId} className="hover:bg-emerald-50/30 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-800 uppercase tracking-tight text-xs truncate">{record.fileName}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {record.batchId.substring(0, 12)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="inline-flex flex-col items-center gap-1 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-md min-w-[70px]">
                                                    <span className="text-sm font-black leading-none">{record.resourceCount}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assets</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2.5 text-slate-500">
                                                    <div className="bg-emerald-50 p-1.5 rounded-lg">
                                                        <Calendar size={14} className="text-emerald-600" />
                                                    </div>
                                                    <span className="text-[11px] font-bold leading-tight">{formatDate(record.uploadTimestamp)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleDeleteBatch(record.batchId, record.fileName)}
                                                        disabled={deletingBatchId === record.batchId}
                                                        title="Purge Batch"
                                                        className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-red-200 ring-1 ring-red-100 hover:ring-red-500 disabled:opacity-50"
                                                    >
                                                        {deletingBatchId === record.batchId ? (
                                                            <Loader size={18} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-500">
                                <Database size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Database Ledger</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Central Archive System</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-400 hover:text-slate-800 hover:border-slate-400 transition-all uppercase tracking-widest text-[10px]"
                        >
                            Close Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
