import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FiltersProvider } from './context/filters.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FiltersProvider>
        <App />
      </FiltersProvider>
    </QueryClientProvider>
  </StrictMode>
)
