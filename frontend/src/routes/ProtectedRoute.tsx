import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth, type Rol } from '../hooks/useAuth'

interface Props {
  children: ReactNode
  rolesPermitidos?: Rol[]
}

export function ProtectedRoute({ children, rolesPermitidos }: Props) {
  const { perfil, cargando } = useAuth()

  if (cargando) return <p className="text-center mt-20">Cargando...</p>
  if (!perfil) return <Navigate to="/login" replace />

  if (rolesPermitidos && !rolesPermitidos.includes(perfil.rol)) {
    const destino = perfil.rol === 'empleada' ? '/' : '/admin/dashboard'
    return <Navigate to={destino} replace />
  }

  return children
}