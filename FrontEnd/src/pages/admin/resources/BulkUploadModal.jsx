import { useState } from "react";
import Papa from "papaparse";
import { bulkCreateResources } from "@/api/resourceApi";
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader, ChevronRight } from "lucide-react";

export default function BulkUploadModal({ onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [stats, setStats] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please select a valid CSV file.");
            setFile(null);
        }
    };

    const downloadTemplate = () => {
        const headers = ["name", "type", "capacity", "location", "status", "availabilityStartTime", "availabilityEndTime"];
        const samples = [
            ["Lecture Hall A", "LECTURE_HALL", "100", "Building 01-102", "AVAILABLE", "08:00", "18:00"],
            ["Computer Lab 01", "LAB", "40", "Building 03-405", "AVAILABLE", "09:00", "17:00"],
            ["Portable Projector", "EQUIPMENT", "1", "Inventory Room", "AVAILABLE", "08:00", "20:00"]
        ];
        
        let csvContent = headers.join(",") + "\n";
        samples.forEach(row => {
            csvContent += row.join(",") + "\n";
        });
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "campus_resources_template.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = () => {
        if (!file) {
            setError("Select a file first.");
            return;
        }

        setLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data.map(row => {
                    // Map various potential header names to internal keys
                    const name = row.name || row.designation || row.Asset || row.Resource;
                    const typeValue = row.type || row.classification || row.Category;
                    const capacity = row.capacity || row.capacityLimit || row.Seats || row.Size;
                    const status = row.status || row.assetStatus || row.State || "AVAILABLE";
                    const startTime = row.availabilityStartTime || row.opsStart || row.startTime || "08:00";
                    const endTime = row.availabilityEndTime || row.opsEnd || row.endTime || "18:00";
                    
                    // Handle location (if split across building/floor)
                    let location = row.location;
                    if (!location && (row.building || row.floor)) {
                        location = `${row.building || ""}${row.building && row.floor ? ", " : ""}${row.floor || ""}`.trim();
                    }

                    // Helper to normalize types (e.g., "Lecture Hall" -> "LECTURE_HALL")
                    const normalizeValue = (val) => val?.trim().toUpperCase().replace(/[\s-]/g, "_");
                    
                    // Helper to ensure time is HH:mm (with leading zero)
                    const normalizeTime = (time) => {
                        if (!time) return "08:00";
                        const trimmed = time.trim();
                        if (/^\d:/.test(trimmed)) return "0" + trimmed; // "8:00" -> "08:00"
                        return trimmed;
                    };

                    const normalizedType = normalizeValue(typeValue);
                    const normalizedStatus = normalizeValue(status);

                    return {
                        name: name?.trim(),
                        type: normalizedType,
                        capacity: parseInt(capacity),
                        location: location?.trim(),
                        status: normalizedStatus === "AVAILABLE" ? "AVAILABLE" : "UNAVAILABLE",
                        availabilityStartTime: normalizeTime(startTime),
                        availabilityEndTime: normalizeTime(endTime)
                    };
                });

                // Strict validation against known types
                const validTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
                const invalidRows = data.filter(r => !r.name || !validTypes.includes(r.type) || isNaN(r.capacity) || !r.location);
                
                if (invalidRows.length > 0) {
                    const firstInvalid = invalidRows[0];
                    setError(`Validation failed: ${invalidRows.length} rows have invalid data. For example, '${firstInvalid.name || "Unknown"}' has type '${firstInvalid.type || "MISSING"}'. Valid types are: LECTURE HALL, LAB, MEETING ROOM, EQUIPMENT.`);
                    setLoading(false);
                    return;
                }

                try {
                    const response = await bulkCreateResources(data);
                    setSuccess("Bulk upload completed successfully!");
                    setStats({ count: response.length });
                    setTimeout(() => {
                        onUploadSuccess();
                        onClose();
                    }, 2000);
                } catch (err) {
                    setError(err.response?.data?.message || "Failed to upload resources. Ensure the types match (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT).");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            error: (err) => {
                setError("Error parsing CSV: " + err.message);
                setLoading(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/40 animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            <Upload size={24} className="text-emerald-300" /> Bulk <span className="text-blue-200">Import</span>
                        </h2>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Batch Processing Unit</p>
                    </div>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/40 rounded-2xl p-3 text-white transition-all backdrop-blur-md border border-white/20">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    {!success ? (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Configuration Source</p>
                                    <button 
                                        onClick={downloadTemplate}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                    >
                                        <Download size={14} /> Get Template
                                    </button>
                                </div>
                                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group shadow-inner">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-4">
                                            <FileText className="text-slate-400 group-hover:text-blue-500" size={32} />
                                        </div>
                                        <p className="text-sm font-black text-slate-500 uppercase tracking-tighter">
                                            {file ? file.name : "Drop registry CSV here"}
                                        </p>
                                        {!file && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">or click to browse filesystem</p>}
                                    </div>
                                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                                </label>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs font-bold text-red-900 leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-5 pt-2">
                                <button 
                                    onClick={onClose}
                                    className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpload}
                                    disabled={!file || loading}
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg"
                                >
                                    {loading ? <Loader className="animate-spin" size={18} /> : (
                                        <>
                                            Execute Sync <ChevronRight size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="py-10 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 shadow-inner">
                                <CheckCircle size={48} className="animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sync Completed</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    <span className="text-emerald-500 font-black">{stats?.count}</span> assets integrated into the cloud registry
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
