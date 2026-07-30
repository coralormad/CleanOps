export function descargarCSV(nombreArchivo: string, filas: Record<string, string | number>[]) {
  if (filas.length === 0) return

  const columnas = Object.keys(filas[0])

  const escapar = (valor: string | number) => {
    const texto = String(valor)
    if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
      return '"' + texto.replace(/"/g, '""') + '"'
    }
    return texto
  }

  const lineas = [columnas.join(',')]
  for (const fila of filas) {
    lineas.push(columnas.map((c) => escapar(fila[c])).join(','))
  }

  const csv = lineas.join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(url)
}