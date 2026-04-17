import { useState, useEffect } from "react";
import { 
    getResources, createResource, updateResource, deleteResource 
} from "@/api/resourceApi";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", capacity: "", location: "", name: "" });
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
    const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"];

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

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNew = () => {
        setFormData({ name: "", type: "LECTURE_HALL", capacity: 1, location: "", status: "ACTIVE", availabilityStartTime: "08:00", availabilityEndTime: "18:00" });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEdit = (resource) => {
        setFormData(resource);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await deleteResource(id);
                loadResources();
            } catch (error) {
                console.error("Failed to delete resource", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateResource(formData.id, formData);
            } else {
                await createResource(formData);
            }
            setShowForm(false);
            loadResources();
        } catch (error) {
            console.error("Failed to save resource", error);
            alert("Error saving resource. Please check the fields.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Facilities & Assets</h1>
                <button 
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={16} /> Add Resource
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end border border-gray-100">
                <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <input 
                        type="text" name="name" value={filters.name} onChange={handleFilterChange}
                        placeholder="Search by name..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select 
                        name="type" value={filters.type} onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Types</option>
                        {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-700">Min Capacity</label>
                    <input 
                        type="number" name="capacity" value={filters.capacity} onChange={handleFilterChange}
                        placeholder="Capacity" min="1"
                        className="border border-gray-300 rounded-md px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input 
                        type="text" name="location" value={filters.location} onChange={handleFilterChange}
                        placeholder="Location"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">No resources found</td>
                            </tr>
                        ) : (
                            resources.map(r => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="bg-gray-100 px-2 py-1 rounded-full">{r.type}</span>
                                    </td>
                                    <td className="px-4 py-3">{r.capacity}</td>
                                    <td className="px-4 py-3">{r.location}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex justify-end gap-2">
                                        <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold">{isEditing ? 'Edit Resource' : 'Add New Resource'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-sm">
                            <div className="space-y-1">
                                <label className="font-medium">Name *</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium">Type *</label>
                                    <select name="type" value={formData.type} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 bg-white">
                                        {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium">Capacity *</label>
                                    <input required type="number" min="1" name="capacity" value={formData.capacity} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium">Location *</label>
                                <input required type="text" name="location" value={formData.location} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium">Available From</label>
                                    <input type="time" name="availabilityStartTime" value={formData.availabilityStartTime || ''} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium">Available To</label>
                                    <input type="time" name="availabilityEndTime" value={formData.availabilityEndTime || ''} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium">Status *</label>
                                <select name="status" value={formData.status} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 bg-white">
                                    {resourceStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">{isEditing ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
