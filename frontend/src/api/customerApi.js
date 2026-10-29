import api from "./api";

// =============================
// GET ALL CUSTOMERS
// =============================
export async function getCustomers(page = 1, limit = 10) {
    const response = await api.get(`/customers?page=${page}&limit=${limit}`);
    return response.data.data;
}

// =============================
// SEARCH CUSTOMERS
// =============================
export async function searchCustomers(search) {
    const response = await api.get(`/customers/search?q=${encodeURIComponent(search)}`);
    return response.data.data;
}

// =============================
// GET CUSTOMER BY ID
// =============================
export async function getCustomer(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
}

// =============================
// ADD CUSTOMER
// =============================
export async function addCustomer(customer) {
    const response = await api.post("/customers", customer);
    return response.data;
}

// =============================
// UPDATE CUSTOMER
// =============================
export async function updateCustomer(id, customer) {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
}

// =============================
// DELETE CUSTOMER
// =============================
export async function deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
}

// =============================
// GENERATE TRANSFORMER SUMMARY
// =============================
export async function generateCustomerSummary(id) {
    const response = await api.post(`/customers/${id}/generate-summary`, {});
    return response.data.data;
}

// =============================
// GENERATE TRANSFORMER PREDICTION
// =============================
export async function generateCustomerPrediction(id) {
    const response = await api.post(`/customers/${id}/generate-prediction`, {});
    return response.data.data;
}