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

    // Intento automático al montar, si ya hay conexión
    if (navigator.onLine) {
      sincronizarPendientes()
    }

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
    <div className="max-w-sm mx-auto mt-10 text-center space-y-4 px-4">
      <h1 className="text-xl font-semibold">Hola, {perfil?.nombreCompleto}</h1>
      <p className="text-sm text-gray-500">Rol: {perfil?.rol}</p>

      {pendientes > 0 && (
        <div className="bg-amber-100 text-amber-800 rounded px-3 py-2 space-y-2">
          <p className="text-xs">
            {pendientes} fichaje{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de sincronizar
          </p>
          <button
            onClick={handleSincronizarManual}
            disabled={sincronizando}
            className="text-xs bg-amber-800 text-white rounded px-3 py-1"
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setTipo('entrada')}
          className={`flex-1 rounded px-3 py-2 text-sm ${tipo === 'entrada' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Entrada
        </button>
        <button
          onClick={() => setTipo('salida')}
          className={`flex-1 rounded px-3 py-2 text-sm ${tipo === 'salida' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Salida
        </button>
      </div>

      <div className="text-left">
        <label className="text-xs text-gray-400 block mb-1">
          Foto {tipo === 'entrada' ? 'de antes' : 'de después'} (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </div>

      {!escaneando && (
        <button
          onClick={() => { setMensaje(null); setEscaneando(true) }}
          disabled={procesando}
          className="w-full bg-slate-900 text-white rounded px-3 py-2"
        >
          Escanear QR para fichar {tipo}
        </button>
      )}

      {escaneando && <QRScanner onScan={handleScan} />}

      <div className="pt-4 border-t space-y-2">
        <p className="text-xs text-gray-400">¿No funciona la cámara? Escribe el código:</p>
        <input
          type="text"
          value={codigoManual}
          onChange={(e) => setCodigoManual(e.target.value)}
          placeholder="Código del edificio"
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleManual}
          disabled={procesando}
          className="w-full bg-gray-200 text-gray-800 rounded px-3 py-2 text-sm"
        >
          Fichar {tipo} con código manual
        </button>
      </div>

      {mensaje && <p className="text-sm">{mensaje}</p>}

      <button onClick={cerrarSesion} className="text-sm text-red-600 underline">
        Cerrar sesión
      </button>
    </div>
  )
}