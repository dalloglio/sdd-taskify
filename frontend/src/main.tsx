import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initPerformanceMonitoring } from './config/performance';
import queryClient from './config/queryClient';
import './styles/globals.css';
import './styles/components.css';

initPerformanceMonitoring();

const root = document.getElementById('root')!;
createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
