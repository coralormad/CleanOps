export function formatearFechaHora(iso: string | null): string {
  if (!iso) return 'Sin cerrar'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}