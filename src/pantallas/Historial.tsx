import type { Almacen } from '../hooks/useAlmacen'

const fmt = (n: number | null, decimales = 1) =>
  n === null ? '—' : n.toFixed(decimales).replace('.', ',')

export function Historial({ almacen }: { almacen: Almacen }) {
  const filas = [...almacen.todas].reverse()

  function borrar(id: string) {
    if (window.confirm('¿Borrar esta medición?')) almacen.eliminar(id)
  }

  return (
    <section className="pantalla">
      <h1>Historial</h1>
      {filas.length === 0 && <p className="suave">Sin mediciones.</p>}
      <ul className="lista">
        {filas.map((m) => (
          <li key={m.id} className="tarjeta fila">
            <div>
              <strong>{m.ventana}</strong>
              <div className="suave">
                {m.fecha} {m.hora} · {m.tipo === 'linea_base' ? 'línea base' : m.modo}
              </div>
            </div>
            <div className="datos">
              <span>{fmt(m.consumoWhKm)} Wh/km</span>
              <span>Batería {fmt(m.bateriaPct, 0)} %</span>
              <span>Presión {fmt(m.presionPsi, 0)} psi</span>
            </div>
            {m.tipo === 'medicion' && (
              <button className="secundario" onClick={() => borrar(m.id)}>Borrar</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
