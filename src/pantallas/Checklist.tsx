import { CHECKLIST } from '../domain/checklist'
import type { Almacen } from '../hooks/useAlmacen'

export function Checklist({ almacen }: { almacen: Almacen }) {
  const hechos = CHECKLIST.filter((i) => almacen.checklist[i.id]).length

  return (
    <section className="pantalla">
      <h1>Checklist</h1>
      <p className="suave">{hechos} de {CHECKLIST.length} listos</p>
      <ul className="lista">
        {CHECKLIST.map((item) => (
          <li key={item.id}>
            <label className="tarjeta check">
              <input
                type="checkbox"
                checked={Boolean(almacen.checklist[item.id])}
                onChange={(e) => almacen.marcar(item.id, e.target.checked)}
              />
              <span>{item.texto}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
