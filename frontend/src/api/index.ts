// src/api/index.ts
import axios from "axios";

// Criar instância do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requisições - adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas - tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401 (não autorizado), limpar dados de auth e redirecionar
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      // Se não estiver na página de login, redirecionar
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
