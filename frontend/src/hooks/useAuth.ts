import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export type Rol = 'empleada' | 'supervisor' | 'gerencia'

interface PerfilAuth {
  id: string
  nombreCompleto: string
  rol: Rol
}

export function useAuth() {
  const [perfil, setPerfil] = useState<PerfilAuth | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarPerfil = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('empleadas')
      .select('id, nombre_completo, rol')
      .eq('id', userId)
      .single()

    if (error || !data) {
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
    // Si no hay conexión, esto probablemente sea un fallo temporal
    // de renovación de token, no un cierre de sesión real — no vaciamos el perfil.
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

  return { perfil, cargando, iniciarSesion, cerrarSesion }
}