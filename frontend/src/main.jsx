import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './themes/ThemeProvider';
import { AuthBootstrap } from './components/auth/AuthBootstrap';
import { TutorialProvider } from './components/tutorial/TutorialProvider';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';
import { DebugPanel } from './components/dev/DebugPanel';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TutorialProvider>
            <AuthBootstrap>
              <App />
            </AuthBootstrap>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem'
                }
              }}
            />
            {import.meta.env.DEV && <DebugPanel />}
          </TutorialProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
