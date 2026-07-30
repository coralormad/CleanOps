import * as XLSX from 'xlsx'

interface Hoja {
  nombre: string
  filas: Record<string, string | number>[]
}

export function descargarExcel(nombreArchivo: string, hojas: Hoja[]) {
  const libro = XLSX.utils.book_new()

  for (const hoja of hojas) {
    if (hoja.filas.length === 0) continue

    const worksheet = XLSX.utils.json_to_sheet(hoja.filas)
    const columnas = Object.keys(hoja.filas[0])

    worksheet['!cols'] = columnas.map((col) => {
      const maxLen = Math.max(col.length, ...hoja.filas.map((fila) => String(fila[col] ?? '').length))
      return { wch: Math.min(maxLen + 2, 40) }
    })

    XLSX.utils.book_append_sheet(libro, worksheet, hoja.nombre.slice(0, 31))
  }

  XLSX.writeFile(libro, nombreArchivo)
}