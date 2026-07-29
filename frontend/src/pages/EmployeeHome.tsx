import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCheckIn } from '../hooks/useCheckIn'
import { useMisTurnos } from '../hooks/useMisTurnos'
import { QRScanner } from '../components/QRScanner'
import { NotificationBell } from '../components/NotificationBell'

type Tipo = 'entrada' | 'salida'

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function MiHorario({ empleadaId }: { empleadaId: string | undefined }) {
  const { turnos, cargando } = useMisTurnos(empleadaId)

  if (cargando) return null
  if (turnos.length === 0) return null

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 text-left space-y-3">
      <h3 className="font-display font-bold text-ink text-sm">Mi horario</h3>
      {turnos.map((t) => {
        const ubicacion = t.ubicaciones_portales
        const enlaceMapa = ubicacion ? 'https://www.google.com/maps/dir/?api=1&destination=' + ubicacion.latitud + ',' + ubicacion.longitud : null

        return (
          <div key={t.id} className="text-xs space-y-0.5">
            <p>
              <span className="font-medium text-ink">{DIAS_SEMANA[t.dia_semana]}</span>{' '}
              <span className="text-muted">{t.hora_inicio.slice(0, 5)}-{t.hora_fin.slice(0, 5)} - {ubicacion?.nombre ?? 'Edificio'}</span>
            </p>
            {ubicacion?.direccion && <p className="text-muted">{ubicacion.direccion}</p>}
            {enlaceMapa && <a href={enlaceMapa} target="_blank" rel="noopener noreferrer" className="text-primary font-medium inline-block pt-0.5">Como llegar</a>}
          </div>
        )
      })}
    </div>
  )
}

export function EmployeeHome() {
  const { perfil, cerrarSesion } = useAuth()
  const { registrarFichaje, procesando, pendientes, actualizarContadorPendientes, sincronizarPendientes } = useCheckIn(perfil?.id, perfil?.nombreCompleto)
  const [tipo, setTipo] = useState<Tipo>('entrada')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [escaneando, setEscaneando] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [foto, setFoto] = useState<File | null>(null)

  useEffect(() => {
    actualizarContadorPendientes()
    if (navigator.onLine) sincronizarPendientes()
    const handleOnline = () => sincronizarPendientes()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [actualizarContadorPendientes, sincronizarPendientes])

  const handleScan = async (codigo: string) => {
    setEscaneando(false)
    const resultado = await registrarFichaje(codigo, tipo, foto)
    setMensaje(resultado.mensaje)
    setFoto(null)
  }

  const handleManual = async () => {
    if (!codigoManual.trim()) return
    const resultado = await registrarFichaje(codigoManual.trim(), tipo, foto)
    setMensaje(resultado.mensaje)
    setCodigoManual('')
    setFoto(null)
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="relative text-center">
          <div className="absolute right-0 top-0">
            <NotificationBell empleadaId={perfil?.id} rol={perfil?.rol} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-extrabold text-white text-base">V</span>
          </div>
          <h1 className="font-display font-bold text-lg text-ink">Hola, {perfil?.nombreCompleto}</h1>
          <p className="text-sm text-muted">Rol: {perfil?.rol}</p>
        </div>

        <MiHorario empleadaId={perfil?.id} />

        {pendientes > 0 && (
          <div className="bg-warning-bg text-warning rounded-xl px-4 py-3 space-y-2">
            <p className="text-xs font-medium">{pendientes} fichaje{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de sincronizar</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setTipo('entrada')} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tipo === 'entrada' ? 'bg-primary text-white' : 'bg-black/5 text-ink'}`}>
              Entrada
            </button>
            <button onClick={() => setTipo('salida')} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${tipo === 'salida' ? 'bg-primary text-white' : 'bg-black/5 text-ink'}`}>
              Salida
            </button>
          </div>

          <div className="text-left">
            <label className="text-xs text-muted block mb-1.5">Foto {tipo === 'entrada' ? 'de antes' : 'de despues'} (opcional)</label>
            <input type="file" accept="image/*" capture="environment" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} className="w-full text-sm text-muted" />
          </div>

          {!escaneando && (
            <button onClick={() => { setMensaje(null); setEscaneando(true) }} disabled={procesando} className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-3 py-2.5">
              Escanear QR para fichar {tipo}
            </button>
          )}

          {escaneando && <QRScanner onScan={handleScan} />}

          <div className="pt-3 border-t border-black/5 space-y-2">
            <p className="text-xs text-muted">No funciona la camara? Escribe el codigo:</p>
            <input type="text" value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} placeholder="Codigo del edificio" className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm" />
            <button onClick={handleManual} disabled={procesando} className="w-full bg-black/5 hover:bg-black/10 transition-colors text-ink font-medium rounded-lg px-3 py-2 text-sm">
              Fichar {tipo} con codigo manual
            </button>
          </div>

          {mensaje && <p className="text-sm text-ink">{mensaje}</p>}
        </div>

        <div className="text-center">
          <button onClick={cerrarSesion} className="text-sm text-danger">Cerrar sesion</button>
        </div>
      </div>
    </div>
  )
}