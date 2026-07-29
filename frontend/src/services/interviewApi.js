import api from "./api";

export const interviewApi = {
  createSession: async (sessionConfig) => {
    const response = await api.post("/interviews", sessionConfig);
    return response.data;
  },

  startSession: async (sessionId) => {
    const response = await api.post(`/interviews/${sessionId}/start`);
    return response.data;
  },

  getInterviewState: async (sessionId) => {
    const response = await api.get(`/interviews/${sessionId}/state`);
    return response.data;
  },

  submitAnswer: async (sessionId, payload) => {
    const response = await api.post(`/interviews/${sessionId}/answer`, payload);
    return response.data;
  },

  completeSession: async (sessionId) => {
    const response = await api.post(`/interviews/${sessionId}/complete`);
    return response.data;
  },

  getInterviewResult: async (sessionId) => {
    const response = await api.get(`/interviews/${sessionId}/result`);
    return response.data;
  },

  abandonSession: async (sessionId) => {
    const response = await api.post(`/interviews/${sessionId}/abandon`);
    return response.data;
  },

  getUserSessions: async () => {
    const response = await api.get("/interviews");
    return response.data;
  },
};
