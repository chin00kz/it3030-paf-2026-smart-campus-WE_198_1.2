import axios from "axios"

const BASE_URL = "http://localhost:8080/api/tickets"

export const createTicket = async (formData) => {
  const response = await axios.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const getTickets = async (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value)
    }
  })

  const response = await axios.get(`${BASE_URL}?${query.toString()}`)
  return response.data
}

export const getActiveTicketsForResource = async (resourceId) => {
  const response = await axios.get(`${BASE_URL}/resource/${resourceId}/active`)
  return response.data
}

export const deleteTicket = async (ticketId, actorEmail) => {
  const response = await axios.delete(`${BASE_URL}/${ticketId}?actorEmail=${encodeURIComponent(actorEmail)}`)
  return response.data
}

export const assignTechnician = async (ticketId, payload) => {
  const response = await axios.patch(`${BASE_URL}/${ticketId}/assign`, payload)
  return response.data
}

export const updateTicketStatus = async (ticketId, payload) => {
  const response = await axios.patch(`${BASE_URL}/${ticketId}/status`, payload)
  return response.data
}

export const addTicketComment = async (ticketId, payload) => {
  const response = await axios.post(`${BASE_URL}/${ticketId}/comments`, payload)
  return response.data
}

export const updateTicketComment = async (ticketId, commentId, payload) => {
  const response = await axios.put(`${BASE_URL}/${ticketId}/comments/${commentId}`, payload)
  return response.data
}

export const deleteTicketComment = async (ticketId, commentId, actorEmail) => {
  const response = await axios.delete(`${BASE_URL}/${ticketId}/comments/${commentId}?actorEmail=${encodeURIComponent(actorEmail)}`)
  return response.data
}

export const buildTicketAttachmentDownloadUrl = (ticketId, attachmentId, actorEmail) => {
  return `${BASE_URL}/${ticketId}/attachments/${attachmentId}?actorEmail=${encodeURIComponent(actorEmail)}`
}

export const getApiError = (error) => {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || "Request failed"
}
