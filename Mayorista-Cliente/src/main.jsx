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

const queryClient = new QueryClient();

// 🔹 Interceptor para axios
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      logout();
    }
    return Promise.reject(error);
  }
);

// 🔹 Interceptor para fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const res = await originalFetch(...args);

  if (res.status === 401 || res.status === 403) {
    logout();
  }

  return res;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FiltersProvider>
        <App />
      </FiltersProvider>
    </QueryClientProvider>
  </StrictMode>
)
