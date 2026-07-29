import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Login } from './pages/Login'
import { EmployeeHome } from './pages/EmployeeHome'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { DashboardPage } from './pages/admin/DashboardPage'
import { EmpleadasPage } from './pages/admin/EmpleadasPage'
import { FichajesPage } from './pages/admin/FichajesPage'
import { SolicitudesPage } from './pages/admin/SolicitudesPage'
import { InformesPage } from './pages/admin/InformesPage'
import { ConfiguracionPage } from './pages/admin/ConfiguracionPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute rolesPermitidos={['empleada']}>
                <EmployeeHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute rolesPermitidos={['supervisor', 'gerencia']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="empleadas" element={<EmpleadasPage />} />
            <Route path="fichajes" element={<FichajesPage />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="informes" element={<InformesPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}