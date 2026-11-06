import { PRESION_RECOMENDADA_PSI, type Medicion } from '../domain/medicion'
import { diferenciaPct } from '../domain/calculos'
import { LINEA_BASE, TRAYECTO_REFERENCIA } from '../domain/lineaBase'
import type { Almacen } from '../hooks/useAlmacen'

function ultimaConConsumo(lista: Medicion[]): Medicion | undefined {
  return [...lista].reverse().find((m) => m.consumoWhKm !== null)
}

export function Inicio({ almacen }: { almacen: Almacen }) {
  const ultima = ultimaConConsumo(almacen.propias)
  const base = LINEA_BASE.find((m) => m.ventana === TRAYECTO_REFERENCIA)?.consumoWhKm ?? null

  const ultimaPresion = [...almacen.propias].reverse().find((m) => m.presionPsi !== null)
  const presionBaja =
    ultimaPresion?.presionPsi != null && ultimaPresion.presionPsi < PRESION_RECOMENDADA_PSI

  let comparacion: string | null = null
  if (ultima && base !== null && ultima.ventana === TRAYECTO_REFERENCIA && ultima.consumoWhKm !== null) {
    const dif = diferenciaPct(ultima.consumoWhKm, base)
    if (dif !== null) {
      const sentido = dif < 0 ? 'menos' : 'más'
      comparacion = `${Math.abs(dif).toFixed(1).replace('.', ',')} % ${sentido} que la línea base (${base.toString().replace('.', ',')} Wh/km)`
    }
  }

  return (
    <section className="pantalla">
      <h1>Inicio</h1>

      {!almacen.persistenciaOk && (
        <div className="alerta">
          El navegador no permite guardar datos. Exporta tus mediciones desde Ajustes antes de cerrar.
        </div>
      )}

      {presionBaja && ultimaPresion && (
        <div className="alerta">
          Última presión registrada: {ultimaPresion.presionPsi} psi. Lo recomendado son {PRESION_RECOMENDADA_PSI} psi en frío.
        </div>
      )}

      <div className="tarjeta">
        <h2>Última medición</h2>
        {ultima ? (
          <>
            <p className="grande">{ultima.consumoWhKm?.toString().replace('.', ',')} Wh/km</p>
            <p className="suave">
              {ultima.ventana} · {ultima.fecha} {ultima.hora}
            </p>
            {comparacion ? <p>{comparacion}</p> : (
              <p className="suave">
                Para comparar con la línea base, mide el trayecto {TRAYECTO_REFERENCIA}.
              </p>
            )}
          </>
        ) : (
          <p className="suave">Aún no hay mediciones propias. Usa “Nueva” para registrar la primera.</p>
        )}
      </div>

      <div className="tarjeta">
        <h2>Recordatorio</h2>
        <p>Carga al 100 % una vez por semana para calibrar la batería LFP.</p>
      </div>
    </section>
  )
}
