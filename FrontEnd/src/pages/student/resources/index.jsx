import { useState, useEffect } from "react";
import { getResources } from "@/api/resourceApi";

export default function StudentResourcesPage() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", capacity: "", location: "", name: "" });
    const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

    useEffect(() => {
        loadResources();
    }, [filters]);

    const loadResources = async () => {
        try {
            const data = await getResources(filters);
            setResources(data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Campus Facilities & Resources</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end border border-gray-100">
                <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Search by name..." className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Types</option>
                        {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-700">Min Capacity</label>
                    <input type="number" name="capacity" value={filters.capacity} onChange={handleFilterChange} placeholder="Capacity" min="1" className="border border-gray-300 rounded-md px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="Location" className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Capacity</th>
                            <th className="px-4 py-3 font-medium">Location</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-500">No resources found</td></tr>
                        ) : (
                            resources.map(r => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                                    <td className="px-4 py-3 text-xs"><span className="bg-gray-100 px-2 py-1 rounded-full">{r.type}</span></td>
                                    <td className="px-4 py-3">{r.capacity}</td>
                                    <td className="px-4 py-3">{r.location}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
