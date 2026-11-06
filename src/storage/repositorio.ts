import type { Medicion } from '../domain/medicion'

const CLAVE_MEDICIONES = 'self-tesla:mediciones:v1'
const CLAVE_CHECKLIST = 'self-tesla:checklist:v1'

/**
 * Lectura y escritura en localStorage. Nunca lanza: si el navegador
 * bloquea el almacenamiento, la app sigue funcionando en memoria.
 */
function leer(clave: string): unknown {
  try {
    const crudo = window.localStorage.getItem(clave)
    return crudo === null ? null : JSON.parse(crudo)
  } catch {
    return null
  }
}

function escribir(clave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

function esMedicion(v: unknown): v is Medicion {
  return typeof v === 'object' && v !== null && typeof (v as Medicion).id === 'string'
}

export function cargarMedicionesPropias(): Medicion[] {
  const v = leer(CLAVE_MEDICIONES)
  return Array.isArray(v) ? v.filter(esMedicion) : []
}

export function guardarMedicionesPropias(mediciones: Medicion[]): boolean {
  return escribir(CLAVE_MEDICIONES, mediciones)
}

export function cargarChecklist(): Record<string, boolean> {
  const v = leer(CLAVE_CHECKLIST)
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return {}
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).filter(([, val]) => typeof val === 'boolean'),
  ) as Record<string, boolean>
}

export function guardarChecklist(estado: Record<string, boolean>): boolean {
  return escribir(CLAVE_CHECKLIST, estado)
}
