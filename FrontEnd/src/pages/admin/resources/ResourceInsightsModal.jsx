import React, { useState, useEffect, useRef } from "react";
import { getResourceInsights, getErrorMessage } from "@/api/resourceApi";
import { 
    X, Download, Loader, PieChart, BarChart3, Building2, MapPin, 
    Users, AlertTriangle, FileText, CheckCircle2, Info
} from "lucide-react";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

export default function ResourceInsightsModal({ onClose }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const data = await getResourceInsights();
            setInsights(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        
        setIsExporting(true);
        try {
            const element = reportRef.current;
            
            // Using htmlToImage instead of html2canvas for better modern CSS/oklch support
            const dataUrl = await htmlToImage.toPng(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });
            
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const img = new Image();
            img.src = dataUrl;
            
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;
            
            const x = (pdfWidth - width) / 2;
            
            pdf.addImage(dataUrl, "PNG", x, 10, width, height);
            pdf.save(`Resource_Insights_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. Error: " + (err.message || "Unknown error"));
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60]">
                <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                    <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Generating Insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
            <div className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                            <PieChart className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">
                                Resource <span className="text-blue-600">Insights</span>
                            </h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Analytics Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {isExporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                            Export PDF
                        </button>
                        <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div className="flex-1 overflow-y-auto p-8" style={{ color: '#1e293b' }}>
                    <div className="max-w-4xl mx-auto space-y-10 bg-white p-8 rounded-3xl shadow-sm border border-[#f1f5f9]" ref={reportRef} style={{ background: '#ffffff' }}>
                        
                        {/* Section 1: Resource Summary */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 border-l-4 border-[#2563eb] pl-4">
                                <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tight">1. Resource Summary</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <SummaryCard title="Total Assets" value={insights.totalResources} icon={<FileText size={18} />} color="bg-[#0f172a]" />
                                {Object.entries(insights.resourcesByType || {}).map(([type, count]) => (
                                    <SummaryCard 
                                        key={type} 
                                        title={type.replace('_', ' ')} 
                                        value={count} 
                                        icon={getTypeIcon(type)} 
                                        color={getTypeColor(type)} 
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Section 2: Status Overview (Donut Chart) */}
                        <div className="grid md:grid-cols-2 gap-10">
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 border-l-4 border-[#10b981] pl-4">
                                    <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tight">2. Status Overview</h3>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-[#f8fafc] rounded-3xl p-6 border border-[#f1f5f9] h-64">
                                    <DonutChart 
                                        active={insights.activeCount} 
                                        inactive={insights.outOfServiceCount} 
                                    />
                                    <div className="mt-6 flex gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">Active: {insights.activeCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-[#f43f5e] rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">OOS: {insights.outOfServiceCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-2 border-l-4 border-[#f59e0b] pl-4">
                                    <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tight">3. Location Distribution</h3>
                                </div>
                                <div className="bg-[#f8fafc] rounded-3xl p-6 border border-[#f1f5f9] h-64 overflow-y-auto space-y-3">
                                    {Object.entries(insights.buildingDistribution || {}).sort((a,b) => b[1] - a[1]).map(([building, count]) => (
                                        <div key={building} className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#f1f5f9] shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-[#fef3c7] p-2 rounded-lg text-[#f59e0b]">
                                                    <Building2 size={14} />
                                                </div>
                                                <span className="text-xs font-black text-[#334155] uppercase tracking-tight">{building}</span>
                                            </div>
                                            <span className="bg-[#0f172a] text-white text-[10px] font-black px-2 py-0.5 rounded-md">{count} <span className="text-[#94a3b8]">Items</span></span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Section 4: Capacity Analysis (Bar Chart) */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 border-l-4 border-[#9333ea] pl-4">
                                <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tight">4. Capacity Analysis</h3>
                            </div>
                            <div className="bg-[#f8fafc] rounded-3xl p-8 border border-[#f1f5f9] flex flex-col items-center">
                                <CapacityBarChart data={insights.capacityAnalysis} />
                                <div className="mt-8 grid grid-cols-3 gap-10 w-full max-w-md">
                                    <BarLabel label="Small (0-50)" value={insights.capacityAnalysis.small} />
                                    <BarLabel label="Medium (50-150)" value={insights.capacityAnalysis.medium} />
                                    <BarLabel label="Large (150+)" value={insights.capacityAnalysis.large} />
                                </div>
                            </div>
                        </section>

                        {/* Section 5: Out of Service List */}
                        <section className="space-y-6 pt-4">
                            <div className="flex items-center gap-2 border-l-4 border-[#e11d48] pl-4">
                                <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tight">5. Out-of-Service Registry</h3>
                            </div>
                            <div className="bg-white rounded-2xl border border-[#f1f5f9] overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                                            <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Asset Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Location</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f8fafc]">
                                        {insights.outOfServiceList.length > 0 ? (
                                            insights.outOfServiceList.map((item, i) => (
                                                <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                                                    <td className="px-6 py-4 font-black text-[#334155] uppercase tracking-tight text-xs">{item.name}</td>
                                                    <td className="px-6 py-4 text-xs font-bold text-[#94a3b8] italic">{item.location}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-md border border-[#e2e8f0]">
                                                            {item.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-10 text-center text-[#94a3b8] font-bold italic">No assets currently out of service.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Footer for PDF */}
                        <div className="pt-10 border-t border-dashed border-[#e2e8f0] flex justify-between items-center opacity-50">
                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.3em]">Generated by Smart Campus Systems</p>
                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.3em]">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-[#f1f5f9] shadow-sm flex flex-col gap-2">
            <div className={`${color} w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest leading-none mb-1">{title}</p>
                <p className="text-xl font-black text-[#1e293b] tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function DonutChart({ active, inactive }) {
    const total = active + inactive || 1;
    const activePercent = (active / total) * 100;
    const perimeter = 2 * Math.PI * 40;
    const activeStroke = (activePercent / 100) * perimeter;
    
    return (
        <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {/* Inactive Slice */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="12" strokeDasharray={`${perimeter} ${perimeter}`} />
                {/* Active Slice */}
                <circle 
                    cx="50" cy="50" r="40" fill="transparent" 
                    stroke="#10b981" strokeWidth="12" 
                    strokeDasharray={`${activeStroke} ${perimeter}`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#1e293b] tracking-tighter leading-none">{Math.round((active / total) * 100)}%</span>
                <span className="text-[8px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mt-1">Operational</span>
            </div>
        </div>
    );
}

function CapacityBarChart({ data }) {
    const max = Math.max(data.small, data.medium, data.large, 1);
    const getHeight = (val) => (val / max) * 100;
    
    return (
        <div className="flex items-end gap-16 h-32 w-full max-w-md px-10">
            <div className="flex-1 bg-[#3b82f6] rounded-t-xl transition-all duration-1000 shadow-lg relative group" style={{ height: `${getHeight(data.small)}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{data.small} Assets</div>
            </div>
            <div className="flex-1 bg-[#6366f1] rounded-t-xl transition-all duration-1000 shadow-lg relative group" style={{ height: `${getHeight(data.medium)}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{data.medium} Assets</div>
            </div>
            <div className="flex-1 bg-[#8b5cf6] rounded-t-xl transition-all duration-1000 shadow-lg relative group" style={{ height: `${getHeight(data.large)}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{data.large} Assets</div>
            </div>
        </div>
    );
}

function BarLabel({ label, value }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-black text-[#1e293b] tracking-tight">{value}</span>
            <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest text-center leading-tight">{label}</span>
        </div>
    );
}

const getTypeIcon = (type) => {
    switch(type) {
        case 'LECTURE_HALL': return <Users size={18} />;
        case 'LAB': return <Info size={18} />;
        case 'MEETING_ROOM': return <Users size={18} />;
        case 'EQUIPMENT': return <MapPin size={18} />;
        default: return <FileText size={18} />;
    }
};

const getTypeColor = (type) => {
    switch(type) {
        case 'LECTURE_HALL': return 'bg-[#3b82f6]';
        case 'LAB': return 'bg-[#10b981]';
        case 'MEETING_ROOM': return 'bg-[#06b6d4]';
        case 'EQUIPMENT': return 'bg-[#f59e0b]';
        default: return 'bg-[#64748b]';
    }
};
