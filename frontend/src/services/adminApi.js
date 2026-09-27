import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getInterviews = async (params = {}) => {
  const response = await api.get("/admin/interviews", { params });
  return response.data;
};

export const getInterviewReport = async (sessionId) => {
  const response = await api.get(`/admin/interviews/${sessionId}`);
  return response.data;
};

export const terminateInterview = async (sessionId, reason) => {
  const response = await api.post(`/admin/interviews/${sessionId}/terminate`, { reason });
  return response.data;
};
