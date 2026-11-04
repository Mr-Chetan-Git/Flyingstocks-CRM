
import api from "./api";

// =====================================
// RESPONSE HELPERS
// =====================================

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function normalizeCustomerList(payload, page, limit) {
  // Handle APIs that return an array directly.
  if (Array.isArray(payload)) {
    return {
      customers: payload,
      total_records: payload.length,
      total_pages: Math.max(1, Math.ceil(payload.length / limit)),
      page,
      limit,
    };
  }

  // Handle APIs that return a nested customer array.
  const customers =
    payload?.customers ??
    payload?.items ??
    payload?.results ??
    payload?.data ??
    [];

  const safeCustomers = Array.isArray(customers) ? customers : [];

  const totalRecords =
    Number(
      payload?.total_records ??
      payload?.total ??
      payload?.count ??
      safeCustomers.length
    ) || 0;

  const totalPages =
    Number(
      payload?.total_pages ??
      payload?.pages ??
      Math.ceil(totalRecords / limit)
    ) || 1;

  return {
    customers: safeCustomers,
    total_records: totalRecords,
    total_pages: Math.max(1, totalPages),
    page: Number(payload?.page ?? page),
    limit: Number(payload?.limit ?? limit),
  };
}

// =====================================
// GET ALL CUSTOMERS
// Supports pagination and filters.
// =====================================

export async function getCustomers(
  page = 1,
  limit = 50,
  filters = {},
  legacyEndDate = ""
) {
  let filterOptions = {};

  // Backward compatibility:
  // getCustomers(page, limit, startDate, endDate)
  if (typeof filters === "string") {
    filterOptions = {
      startDate: filters,
      endDate: legacyEndDate,
    };
  } else if (filters && typeof filters === "object") {
    filterOptions = filters;
  }

  const params = {
    page,
    limit,
  };

  if (filterOptions.startDate) {
    params.start_date = filterOptions.startDate;
  }

  if (filterOptions.endDate) {
    params.end_date = filterOptions.endDate;
  }

  if (filterOptions.state && filterOptions.state !== "All") {
    params.state = filterOptions.state;
  }

  if (filterOptions.searchName?.trim()) {
    params.name = filterOptions.searchName.trim();
  }

  const response = await api.get("/customers", { params });

  return normalizeCustomerList(getResponseData(response), page, limit);
}

// =====================================
// SEARCH CUSTOMERS
// Supports pagination.
// =====================================

export async function searchCustomers(
  search,
  page = 1,
  limit = 50
) {
  const params = {
    q: search.trim(),
    page,
    limit,
  };

  const response = await api.get("/customers/search", {
    params,
  });

  const payload = getResponseData(response);

  return normalizeCustomerList(payload, page, limit);
}

// =====================================
// GET CUSTOMER BY ID
// =====================================

export async function getCustomer(id) {
  const response = await api.get(`/customers/${id}`);

  return getResponseData(response);
}

// =====================================
// ADD CUSTOMER
// =====================================

export async function addCustomer(customer) {
  const response = await api.post("/customers", customer);

  return response.data;
}

// =====================================
// UPDATE CUSTOMER
// =====================================

export async function updateCustomer(id, customer) {
  const response = await api.put(`/customers/${id}`, customer);

  return response.data;
}

// =====================================
// DELETE CUSTOMER
// =====================================

export async function deleteCustomer(id) {
  const response = await api.delete(`/customers/${id}`);

  return response.data;
}

// =====================================
// GENERATE TRANSFORMER SUMMARY
// =====================================

export async function generateCustomerSummary(id) {
  const response = await api.post(`/customers/${id}/summary`);

  return response.data;
}

// =====================================
// GENERATE TRANSFORMER PREDICTION
// =====================================

export async function generateCustomerPrediction(id) {
  const response = await api.post(
    `/customers/${id}/generate-prediction`,
    {}
  );

  return response.data?.data ?? response.data;
}
