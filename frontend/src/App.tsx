import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Gastos } from './pages/Gastos';
import { Comida } from './pages/Comida';
import { Gimnasio } from './pages/Gimnasio';
import { Ahorros } from './pages/Ahorros';
import { Mas } from './pages/Mas';
import { hasSession } from './services/api/client';

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: ReactNode }) {
  return hasSession() ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/gastos"
            element={
              <RequireAuth>
                <Gastos />
              </RequireAuth>
            }
          />
          <Route
            path="/comida"
            element={
              <RequireAuth>
                <Comida />
              </RequireAuth>
            }
          />
          <Route
            path="/gimnasio"
            element={
              <RequireAuth>
                <Gimnasio />
              </RequireAuth>
            }
          />
          <Route
            path="/ahorros"
            element={
              <RequireAuth>
                <Ahorros />
              </RequireAuth>
            }
          />
          <Route
            path="/mas"
            element={
              <RequireAuth>
                <Mas />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
