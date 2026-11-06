import { useState, type FormEvent } from 'react'
import { parsearNumero } from '../domain/csv'
import { MODOS, type Medicion } from '../domain/medicion'
import type { Almacen } from '../hooks/useAlmacen'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fechaHoy(ahora: Date) {
  const dd = String(ahora.getDate()).padStart(2, '0')
  const hh = String(ahora.getHours()).padStart(2, '0')
  const mi = String(ahora.getMinutes()).padStart(2, '0')
  return { fecha: `${dd}-${MESES[ahora.getMonth()]}`, hora: `${hh}:${mi}` }
}

function leerNumero(texto: string, nombre: string): number | null {
  try {
    return parsearNumero(texto)
  } catch {
    throw new Error(`${nombre} debe ser un número.`)
  }
}

export function NuevaMedicion({ almacen, alGuardar }: { almacen: Almacen; alGuardar: () => void }) {
  const [ventana, setVentana] = useState('Casa-colegio (126,5 km)')
  const [consumo, setConsumo] = useState('')
  const [bateria, setBateria] = useState('')
  const [autonomia, setAutonomia] = useState('')
  const [energia, setEnergia] = useState('')
  const [presion, setPresion] = useState('42')
  const [temp, setTemp] = useState('')
  const [modo, setModo] = useState<string>('Relax')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)

  function enviar(e: FormEvent) {
    e.preventDefault()
    try {
      if (ventana.trim() === '') throw new Error('Indica el trayecto o la ventana.')
      const consumoWhKm = leerNumero(consumo, 'El consumo')
      if (consumoWhKm === null || consumoWhKm <= 0) throw new Error('Indica el consumo en Wh/km.')

      const { fecha, hora } = fechaHoy(new Date())
      const medicion: Medicion = {
        id: crypto.randomUUID(),
        fecha,
        hora,
        tipo: 'medicion',
        ventana: ventana.trim(),
        bateriaPct: leerNumero(bateria, 'La batería'),
        autonomiaKm: leerNumero(autonomia, 'La autonomía'),
        consumoWhKm,
        energiaKwh: leerNumero(energia, 'La energía'),
        presionPsi: leerNumero(presion, 'La presión'),
        tempC: leerNumero(temp, 'La temperatura'),
        modo,
        notas: notas.trim(),
      }
      almacen.agregar(medicion)
      alGuardar()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section className="pantalla">
      <h1>Nueva medición</h1>
      <form className="formulario" onSubmit={enviar}>
        <label>
          Trayecto o ventana
          <input value={ventana} onChange={(e) => setVentana(e.target.value)} required />
        </label>
        <label>
          Consumo (Wh/km)
          <input inputMode="decimal" value={consumo} onChange={(e) => setConsumo(e.target.value)} required />
        </label>
        <label>
          Batería (%)
          <input inputMode="decimal" value={bateria} onChange={(e) => setBateria(e.target.value)} />
        </label>
        <label>
          Autonomía (km)
          <input inputMode="decimal" value={autonomia} onChange={(e) => setAutonomia(e.target.value)} />
        </label>
        <label>
          Energía (kWh)
          <input inputMode="decimal" value={energia} onChange={(e) => setEnergia(e.target.value)} />
        </label>
        <label>
          Presión (psi)
          <input inputMode="decimal" value={presion} onChange={(e) => setPresion(e.target.value)} />
        </label>
        <label>
          Temperatura (°C)
          <input inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value)} />
        </label>
        <label>
          Modo
          <select value={modo} onChange={(e) => setModo(e.target.value)}>
            {MODOS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Notas
          <input value={notas} onChange={(e) => setNotas(e.target.value)} />
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="principal">Guardar medición</button>
      </form>
    </section>
  )
}
