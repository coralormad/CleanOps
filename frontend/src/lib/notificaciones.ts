import { supabase } from './supabaseClient'

export async function notificarStaff(mensaje: string, enlace?: string) {
  await supabase.from('notificaciones').insert({
    destino: 'staff',
    mensaje,
    enlace: enlace ?? null,
  })
}

export async function notificarEmpleada(empleadaId: string, mensaje: string, enlace?: string) {
  await supabase.from('notificaciones').insert({
    destino: 'empleada_especifica',
    destinatario_id: empleadaId,
    mensaje,
    enlace: enlace ?? null,
  })
}