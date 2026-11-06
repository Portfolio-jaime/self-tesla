export type TipoMedicion = 'linea_base' | 'medicion'

export interface Medicion {
  id: string
  fecha: string
  hora: string
  tipo: TipoMedicion
  ventana: string
  bateriaPct: number | null
  autonomiaKm: number | null
  consumoWhKm: number | null
  energiaKwh: number | null
  presionPsi: number | null
  tempC: number | null
  modo: string
  notas: string
}

export const MODOS = ['Relax', 'Estándar', 'Rápido'] as const

/** Presión recomendada en frío para el Model Y (etiqueta de la puerta del conductor). */
export const PRESION_RECOMENDADA_PSI = 42
