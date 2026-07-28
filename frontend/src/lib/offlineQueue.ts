import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface FichajePendiente {
  id: string
  empleadaId: string
  codigoQr: string
  tipo: 'entrada' | 'salida'
  fotoBlob: Blob | null
  fotoNombre: string | null
  fechaHoraDispositivo: string
}

interface FichajesDB extends DBSchema {
  'pending-checkins': {
    key: string
    value: FichajePendiente
  }
}

let dbPromise: Promise<IDBPDatabase<FichajesDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FichajesDB>('cleanops-offline', 1, {
      upgrade(db) {
        db.createObjectStore('pending-checkins', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function encolarFichaje(item: FichajePendiente) {
  const db = await getDB()
  await db.put('pending-checkins', item)
}

export async function obtenerFichajesPendientes(): Promise<FichajePendiente[]> {
  const db = await getDB()
  return db.getAll('pending-checkins')
}

export async function eliminarFichajePendiente(id: string) {
  const db = await getDB()
  await db.delete('pending-checkins', id)
}