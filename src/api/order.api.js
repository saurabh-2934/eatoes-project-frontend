import api from "./axiosInstance";

export const getOrders = (params) => api.get("/api/orders", { params });

export const updateOrderStatus = (id, status) =>
  api.patch(`/api/orders/${id}/status`, { status });
