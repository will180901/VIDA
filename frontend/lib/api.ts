import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important pour les httpOnly cookies
});

// Variable pour éviter les tentatives multiples de refresh simultanées
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour gérer le refresh automatique du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de refresh
    // ET que ce n'est pas une requête de login/register/refresh/profile
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login/') &&
      !originalRequest.url?.includes('/auth/register/') &&
      !originalRequest.url?.includes('/auth/refresh/')
    ) {
      // Si on est déjà en train de rafraîchir, mettre en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenter de refresh le token
        const refreshResponse = await api.post('/auth/refresh/');
        
        // Si le refresh réussit
        if (refreshResponse.status === 200) {
          isRefreshing = false;
          processQueue(null, 'success');
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Si le refresh échoue avec 401 ou 429, ne pas rediriger automatiquement
        // Laisser l'utilisateur sur la page actuelle
        if (refreshError.response?.status === 401 || refreshError.response?.status === 429) {
          // Ne rien faire, l'utilisateur n'est probablement pas connecté
          return Promise.reject(refreshError);
        }
        
        // Pour les autres erreurs, rediriger vers la page de connexion
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/connexion')) {
          window.location.href = '/connexion';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
