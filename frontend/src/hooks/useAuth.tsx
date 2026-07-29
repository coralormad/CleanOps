import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabaseClient'

export type Rol = 'empleada' | 'supervisor' | 'gerencia'

interface PerfilAuth {
  id: string
  nombreCompleto: string
  rol: Rol
}

interface AuthContextValue {
  perfil: PerfilAuth | null
  cargando: boolean
  iniciarSesion: (email: string, password: string) => Promise<Error | null>
  cerrarSesion: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilAuth | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarPerfil = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('empleadas')
      .select('id, nombre_completo, rol, activo')
      .eq('id', userId)
      .single()

    if (error || !data) {
      setPerfil(null)
      return
    }

    if (!data.activo) {
      // Cuenta desactivada: la echamos de verdad, no solo la ocultamos.
      await supabase.auth.signOut()
      setPerfil(null)
      return
    }

    setPerfil({
      id: data.id,
      nombreCompleto: data.nombre_completo,
      rol: data.rol,
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        cargarPerfil(session.user.id).finally(() => setCargando(false))
      } else {
        setCargando(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCargando(true)
        cargarPerfil(session.user.id).finally(() => setCargando(false))
      } else {
        if (navigator.onLine) {
          setPerfil(null)
        }
        setCargando(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [cargarPerfil])

  const iniciarSesion = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ perfil, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}