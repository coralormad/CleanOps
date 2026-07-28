import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCheckIn } from '../hooks/useCheckIn'
import { QRScanner } from '../components/QRScanner'

type Tipo = 'entrada' | 'salida'

export function EmployeeHome() {
  const { perfil, cerrarSesion } = useAuth()
  const { registrarFichaje, procesando, pendientes, actualizarContadorPendientes, sincronizarPendientes } =
    useCheckIn(perfil?.id)
  const [tipo, setTipo] = useState<Tipo>('entrada')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [escaneando, setEscaneando] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [sincronizando, setSincronizando] = useState(false)

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

  const handleSincronizarManual = async () => {
    setSincronizando(true)
    await sincronizarPendientes()
    setSincronizando(false)
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-extrabold text-white text-base">V</span>
          </div>
          <h1 className="font-display font-bold text-lg text-ink">Hola, {perfil?.nombreCompleto}</h1>
          <p className="text-sm text-muted">Rol: {perfil?.rol}</p>
        </div>

        {pendientes > 0 && (
          <div className="bg-warning-bg text-warning rounded-xl px-4 py-3 space-y-2">
            <p className="text-xs font-medium">
              {pendientes} fichaje{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de sincronizar
            </p>
            <button
              onClick={handleSincronizarManual}
              disabled={sincronizando}
              className="text-xs bg-warning text-white rounded-lg px-3 py-1.5 font-medium"
            >
              {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTipo('entrada')}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tipo === 'entrada' ? 'bg-primary text-white' : 'bg-black/5 text-ink'
              }`}
            >
              Entrada
            </button>
            <button
              onClick={() => setTipo('salida')}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tipo === 'salida' ? 'bg-primary text-white' : 'bg-black/5 text-ink'
              }`}
            >
              Salida
            </button>
          </div>

          <div className="text-left">
            <label className="text-xs text-muted block mb-1.5">
              Foto {tipo === 'entrada' ? 'de antes' : 'de después'} (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-muted"
            />
          </div>

          {!escaneando && (
            <button
              onClick={() => { setMensaje(null); setEscaneando(true) }}
              disabled={procesando}
              className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-3 py-2.5"
            >
              Escanear QR para fichar {tipo}
            </button>
          )}

          {escaneando && <QRScanner onScan={handleScan} />}

          <div className="pt-3 border-t border-black/5 space-y-2">
            <p className="text-xs text-muted">¿No funciona la cámara? Escribe el código:</p>
            <input
              type="text"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Código del edificio"
              className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleManual}
              disabled={procesando}
              className="w-full bg-black/5 hover:bg-black/10 transition-colors text-ink font-medium rounded-lg px-3 py-2 text-sm"
            >
              Fichar {tipo} con código manual
            </button>
          </div>

          {mensaje && <p className="text-sm text-ink">{mensaje}</p>}
        </div>

        <div className="text-center">
          <button onClick={cerrarSesion} className="text-sm text-danger">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}