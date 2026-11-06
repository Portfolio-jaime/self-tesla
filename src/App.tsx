import { useState } from 'react'
import { useAlmacen } from './hooks/useAlmacen'
import { Ajustes } from './pantallas/Ajustes'
import { Checklist } from './pantallas/Checklist'
import { Historial } from './pantallas/Historial'
import { Inicio } from './pantallas/Inicio'
import { NuevaMedicion } from './pantallas/NuevaMedicion'

type Pantalla = 'inicio' | 'nueva' | 'historial' | 'checklist' | 'ajustes'

const PESTANAS: { id: Pantalla; etiqueta: string }[] = [
  { id: 'inicio', etiqueta: 'Inicio' },
  { id: 'nueva', etiqueta: 'Nueva' },
  { id: 'historial', etiqueta: 'Historial' },
  { id: 'checklist', etiqueta: 'Checklist' },
  { id: 'ajustes', etiqueta: 'Ajustes' },
]

export default function App() {
  const almacen = useAlmacen()
  const [pantalla, setPantalla] = useState<Pantalla>('inicio')

  return (
    <div className="app">
      <main className="contenido">
        {pantalla === 'inicio' && <Inicio almacen={almacen} />}
        {pantalla === 'nueva' && (
          <NuevaMedicion almacen={almacen} alGuardar={() => setPantalla('historial')} />
        )}
        {pantalla === 'historial' && <Historial almacen={almacen} />}
        {pantalla === 'checklist' && <Checklist almacen={almacen} />}
        {pantalla === 'ajustes' && <Ajustes almacen={almacen} />}
      </main>

      <nav className="pestanas" aria-label="Secciones">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            className={p.id === pantalla ? 'activa' : ''}
            aria-current={p.id === pantalla ? 'page' : undefined}
            onClick={() => setPantalla(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </nav>
    </div>
  )
}
