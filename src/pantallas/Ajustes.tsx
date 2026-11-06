import { useState } from 'react'
import { parsearCsv, serializarCsv } from '../domain/csv'
import type { Almacen } from '../hooks/useAlmacen'

export function Ajustes({ almacen }: { almacen: Almacen }) {
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errores, setErrores] = useState<string[]>([])

  function exportar() {
    const contenido = serializarCsv(almacen.todas)
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'self-tesla-mediciones.csv'
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
    setMensaje(`Exportadas ${almacen.todas.length} filas.`)
    setErrores([])
  }

  async function importar(archivo: File) {
    const texto = await archivo.text()
    const { mediciones, errores: fallos } = parsearCsv(texto)
    // La línea base ya viene en la app; no se duplica al importar.
    const nuevas = mediciones.filter((m) => m.tipo === 'medicion')
    almacen.reemplazarPropias([...almacen.propias, ...nuevas])
    setMensaje(`Importadas ${nuevas.length} mediciones. Las filas de línea base se omitieron.`)
    setErrores(fallos)
  }

  function borrarPropias() {
    if (!window.confirm('¿Borrar todas tus mediciones? La línea base se conserva.')) return
    almacen.reemplazarPropias([])
    setMensaje('Mediciones propias borradas.')
    setErrores([])
  }

  return (
    <section className="pantalla">
      <h1>Ajustes</h1>

      <div className="tarjeta">
        <h2>Exportar</h2>
        <p className="suave">Descarga un CSV con el mismo formato de la línea base.</p>
        <button className="principal" onClick={exportar}>Exportar CSV</button>
      </div>

      <div className="tarjeta">
        <h2>Importar</h2>
        <p className="suave">Agrega mediciones desde un CSV exportado antes.</p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const archivo = e.target.files?.[0]
            if (archivo) void importar(archivo)
            e.target.value = ''
          }}
        />
      </div>

      <div className="tarjeta">
        <h2>Borrar</h2>
        <p className="suave">Elimina solo tus mediciones. La línea base no se borra.</p>
        <button className="peligro" onClick={borrarPropias}>Borrar mis mediciones</button>
      </div>

      {mensaje && <p className="mensaje">{mensaje}</p>}
      {errores.length > 0 && (
        <ul className="errores">
          {errores.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </section>
  )
}
