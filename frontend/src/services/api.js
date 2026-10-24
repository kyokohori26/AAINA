import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aaina_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes("/auth") && !window.location.pathname.includes("/parent-demo") && window.location.pathname !== "/") {
        localStorage.removeItem("aaina_token");
        localStorage.removeItem("aaina_user");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me")
};

export const profileAPI = {
  getProfile: () => api.get("/profile"),
  saveQuestionnaire: (data) => api.post("/profile/questionnaire", data),
  updateProfile: (data) => api.put("/profile", data),
  uploadPhoto: (formData) => api.post("/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  deletePhoto: () => api.delete("/profile/photo")
};

export const diaryAPI = {
  createEntry: (data) => {
    if (data instanceof FormData) {
      return api.post("/diary/entries", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }
    return api.post("/diary/entries", data);
  },
  getEntries: (params) => api.get("/diary/entries", { params }),
  getEntry: (id) => api.get(`/diary/entries/${id}`),
  deleteEntry: (id) => api.delete(`/diary/entries/${id}`),
  regenerateReply: (id, persona) => api.post(`/diary/entries/${id}/regenerate`, { persona }),
  continueConversation: (id, text, persona) => api.post(`/diary/entries/${id}/reply`, { text, persona }),
  submitFeedback: (id, helpful) => api.post(`/diary/entries/${id}/feedback`, { helpful })
};

export const moodAPI = {
  getSummary: (range = "week") => api.get("/mood/summary", { params: { range } })
};

export const circleAPI = {
  getPeople: () => api.get("/circle/people"),
  addPerson: (data) => api.post("/circle/people", data),
  updatePerson: (id, data) => api.put(`/circle/people/${id}`, data),
  deletePerson: (id) => api.delete(`/circle/people/${id}`),
  getNudges: () => api.get("/circle/nudges")
};

export const memoryAPI = {
  getMemories: () => api.get("/memory"),
  deleteMemory: (id) => api.delete(`/memory/${id}`)
};

export const guardianAPI = {
  getGuardians: () => api.get("/guardians"),
  addGuardian: (data) => api.post("/guardians", data),
  deleteGuardian: (id) => api.delete(`/guardians/${id}`)
};

export const alertAPI = {
  getHistory: () => api.get("/alerts/history"),
  getDemoView: (userId) => api.get("/alerts/demo-view", { params: { user_id: userId } })
};

export const nudgeAPI = {
  getPending: () => api.get("/nudges/pending"),
  dismiss: (id) => api.post(`/nudges/${id}/dismiss`),
  simulate: (daysAgo = 4) => api.post("/nudges/simulate", { days_ago: daysAgo })
};

export const accountAPI = {
  exportData: () => api.get("/account/export", { responseType: "blob" }),
  deleteData: () => api.delete("/account/data")
};

export default api;
