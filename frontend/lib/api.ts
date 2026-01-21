import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important pour les httpOnly cookies
});

// Intercepteur pour gérer le refresh automatique du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de refresh
    // ET que ce n'est pas une requête de login/register/refresh
    // ET que ce n'est pas une requête publique (appointments, dashboard_stats, etc.)
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login/') &&
      !originalRequest.url?.includes('/auth/register/') &&
      !originalRequest.url?.includes('/auth/refresh/') &&
      !originalRequest.url?.includes('/auth/profile/') &&
      !originalRequest.url?.includes('/appointments/appointments/') &&
      !originalRequest.url?.includes('/dashboard_stats/')
    ) {
      originalRequest._retry = true;

      try {
        // Tenter de refresh le token
        await api.post('/auth/refresh/');
        // Réessayer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, ne rien faire (pas de redirection automatique)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
