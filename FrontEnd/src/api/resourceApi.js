import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/resources';

export const getResources = async (filters) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.capacity) params.append('capacity', filters.capacity);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.name) params.append('name', filters.name);
    
    const response = await axios.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
};

export const getResourceById = async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
};

export const createResource = async (resource) => {
    const response = await axios.post(BASE_URL, resource);
    return response.data;
};

export const updateResource = async (id, resource) => {
    const response = await axios.put(`${BASE_URL}/${id}`, resource);
    return response.data;
};

export const deleteResource = async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
};
