import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!navigator.onLine) {
      setError('Sin conexión a internet. Necesitas red para iniciar sesión la primera vez.')
      return
    }

    const loginError = await iniciarSesion(email, password)
    if (loginError) {
      if (loginError.message.toLowerCase().includes('fetch')) {
        setError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.')
      } else {
        setError('Correo o contraseña incorrectos.')
      }
      return
    }
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4 px-4">
      <h1 className="text-xl font-semibold">Iniciar sesión</h1>
      <input
        type="email"
        placeholder="Correo corporativo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-slate-900 text-white rounded px-3 py-2">
        Entrar
      </button>
    </form>
  )
}