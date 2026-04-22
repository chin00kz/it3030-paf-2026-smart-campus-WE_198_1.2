import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/resources';

export const getResources = async (filters, page = 0, size = 10) => {
    try {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.capacity) params.append('capacity', filters.capacity);
        if (filters?.location) params.append('location', filters.location);
        if (filters?.name) params.append('name', filters.name);
        if (filters?.status) params.append('status', filters.status);
        params.append('page', page);
        params.append('size', size);
        
        const response = await axios.get(`${BASE_URL}?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching resources:', error);
        throw error;
    }
};

export const getResourceById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching resource:', error);
        throw error;
    }
};

export const createResource = async (resource) => {
    try {
        const response = await axios.post(BASE_URL, resource);
        return response.data;
    } catch (error) {
        console.error('Error creating resource:', error);
        throw error;
    }
};

export const bulkCreateResources = async (resources) => {
    try {
        const response = await axios.post(`${BASE_URL}/bulk`, resources);
        return response.data;
    } catch (error) {
        console.error('Error bulk creating resources:', error);
        throw error;
    }
};

export const updateResource = async (id, resource) => {
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, resource);
        return response.data;
    } catch (error) {
        console.error('Error updating resource:', error);
        throw error;
    }
};

export const deleteResource = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting resource:', error);
        throw error;
    }
};

export const getResourceInsights = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/insights`);
        return response.data;
    } catch (error) {
        console.error('Error fetching resource insights:', error);
        throw error;
    }
};

export const getBulkUploadHistory = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/bulk/history`);
        return response.data;
    } catch (error) {
        console.error('Error fetching upload history:', error);
        throw error;
    }
};

export const deleteBulkBatch = async (batchId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/bulk/${batchId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting bulk batch:', error);
        throw error;
    }
};

/**
 * Helper function to extract error message from API response
 */
export const getErrorMessage = (error) => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    } else if (error?.response?.data?.details) {
        const details = error.response.data.details;
        return Object.values(details)[0] || 'An error occurred';
    } else if (error?.message) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
};
