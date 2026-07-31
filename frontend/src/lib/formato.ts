export function formatearFechaHora(iso: string | null): string {
  if (!iso) return 'Sin cerrar'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
export function formatearHoras(horas: number): string {
  const totalMinutos = Math.round(horas * 60)
  const h = Math.floor(totalMinutos / 60)
  const m = totalMinutos % 60
  if (h === 0) return m + 'm'
  if (m === 0) return h + 'h'
  return h + 'h ' + m + 'm'
}