import api from "./axiosInstance";

export const getMenu = (params) => api.get("/api/menu", { params });

export const searchMenu = (query) => api.get(`/api/menu/search?q=${query}`);

export const toggleMenuAvailability = (id) =>
  api.patch(`/api/menu/${id}/availability`);
