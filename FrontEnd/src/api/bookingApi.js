import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/bookings';

export const createBooking = async (bookingData) => {
    try {
        const response = await axios.post(BASE_URL, bookingData);
        return response.data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

export const getMyBookings = async (email) => {
    try {
        const response = await axios.get(`${BASE_URL}/my?email=${email}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching my bookings:', error);
        throw error;
    }
};

export const getAllBookings = async () => {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw error;
    }
};

export const updateBookingStatus = async (id, status, declineReason = "") => {
    try {
        const response = await axios.patch(`${BASE_URL}/${id}/status`, { status, declineReason });
        return response.data;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
};

export const cancelBooking = async (id, email) => {
    try {
        const response = await axios.patch(`${BASE_URL}/${id}/cancel`, { email });
        return response.data;
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
    }
};
