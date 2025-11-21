import axios from "axios";

const CERTI_BASE_URL = "http://localhost:9091/api"; // API CERTIFICADORA

const apiCerti = axios.create({
  baseURL: CERTI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Token exclusivo para la API CERTI ---
apiCerti.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("certiToken"); // token distinto
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Error handler exclusivo (CORREGIDO) ---
apiCerti.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("certiToken");
      
     
      console.warn("Token de Certificación caducado. El usuario debe iniciar sesión en el Certificador de nuevo.");
      

    }
    return Promise.reject(error);
  }
);

export default apiCerti;