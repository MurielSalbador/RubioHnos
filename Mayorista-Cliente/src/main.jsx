import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FiltersProvider } from './context/filters.jsx';

// 👇 imports para interceptores
import axios from "axios";
import { logout } from "./utils/auth";
import { jwtDecode } from "jwt-decode";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de frescura en la RAM del cliente
      refetchOnWindowFocus: false, // Evita refetch si el usuario cambia de pestaña y vuelve
    },
  },
});

// 🔹 Interceptor para axios
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el status es 401 o 403, verificamos si el token realmente expiró
    if ((error.response?.status === 401 || error.response?.status === 403)) {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
      } else {
        try {
          const decoded = jwtDecode(token);
          const now = Date.now() / 1000;

          // Si realmente expiró, hacemos logout; si no, ignoramos
          if (decoded.exp < now) {
            logout();
          }
        } catch {
          logout();
        }
      }
    }
    return Promise.reject(error);
  }
);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FiltersProvider>
        <App />
      </FiltersProvider>
    </QueryClientProvider>
  </StrictMode>
)
