import axios from "axios";

const API = "http://127.0.0.1:8000/email-history";

// Get all email scans
export const getEmailHistory = async () => {
    const response = await axios.get(`${API}/`);
    return response.data;
};

// Get email summary
export const getEmailSummary = async () => {
    const response = await axios.get(`${API}/stats/summary`);
    return response.data;
};

// Get one email
export const getEmail = async (id) => {
    const response = await axios.get(`${API}/${id}`);
    return response.data;
};

// Delete one email
export const deleteEmail = async (id) => {
    const response = await axios.delete(`${API}/${id}`);
    return response.data;
};

// Delete all emails
export const deleteAllEmails = async () => {
    const response = await axios.delete(`${API}/`);
    return response.data;
};