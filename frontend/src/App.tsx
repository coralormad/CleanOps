import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { EmployeeHome } from './pages/EmployeeHome'
import { AdminDashboard } from './pages/AdminDashboard'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

function Home() {
  const { perfil } = useAuth()
  return perfil?.rol === 'empleada' ? <EmployeeHome /> : <AdminDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}