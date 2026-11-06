import type { Medicion, TipoMedicion } from './medicion'

/**
 * Formato de datos/comparacion-consumo.csv:
 * separador `;`, decimal `,`, y cabecera en español.
 */
export const CABECERA_CSV = [
  'Fecha',
  'Hora',
  'Tipo',
  'Ventana o trayecto',
  'Batería (%)',
  'Autonomía (km)',
  'Consumo (Wh/km)',
  'Energía (kWh)',
  'Presión (psi)',
  'Temp. (°C)',
  'Modo',
  'Notas',
] as const

const SEPARADOR = ';'

const ETIQUETA_TIPO: Record<TipoMedicion, string> = {
  linea_base: 'Línea base',
  medicion: 'Medición',
}

function tipoDesdeEtiqueta(texto: string): TipoMedicion | null {
  const t = texto.trim().toLowerCase()
  if (t === 'línea base' || t === 'linea base') return 'linea_base'
  if (t === 'medición' || t === 'medicion') return 'medicion'
  return null
}

/** Divide una línea respetando campos entre comillas dobles. */
export function dividirLinea(linea: string): string[] {
  const campos: string[] = []
  let actual = ''
  let entreComillas = false

  for (let i = 0; i < linea.length; i++) {
    const c = linea[i]
    if (entreComillas) {
      if (c === '"' && linea[i + 1] === '"') {
        actual += '"'
        i++
      } else if (c === '"') {
        entreComillas = false
      } else {
        actual += c
      }
    } else if (c === '"') {
      entreComillas = true
    } else if (c === SEPARADOR) {
      campos.push(actual)
      actual = ''
    } else {
      actual += c
    }
  }
  campos.push(actual)
  return campos
}

/** Número con decimal `,` o `.`. Vacío devuelve null; texto inválido lanza error. */
export function parsearNumero(texto: string): number | null {
  const limpio = texto.trim()
  if (limpio === '') return null
  const n = Number(limpio.replace(',', '.'))
  if (!Number.isFinite(n)) throw new Error(`número inválido: "${texto}"`)
  return n
}

export interface ResultadoCsv {
  mediciones: Medicion[]
  errores: string[]
}

/**
 * Lee el CSV y devuelve las mediciones válidas más una lista de errores por línea.
 * `generarId` permite inyectar ids en pruebas.
 */
export function parsearCsv(
  texto: string,
  generarId: () => string = () => crypto.randomUUID(),
): ResultadoCsv {
  const lineas = texto
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')

  const resultado: ResultadoCsv = { mediciones: [], errores: [] }
  if (lineas.length === 0) return resultado

  const cabecera = dividirLinea(lineas[0]).map((c) => c.trim())
  if (cabecera.length < CABECERA_CSV.length || cabecera[0] !== CABECERA_CSV[0]) {
    resultado.errores.push('La cabecera no coincide con el formato esperado.')
    return resultado
  }

  lineas.slice(1).forEach((linea, indice) => {
    const numeroLinea = indice + 2
    const c = dividirLinea(linea)
    const tipo = tipoDesdeEtiqueta(c[2] ?? '')
    if (!tipo) {
      resultado.errores.push(`Línea ${numeroLinea}: tipo desconocido "${c[2] ?? ''}".`)
      return
    }
    try {
      resultado.mediciones.push({
        id: generarId(),
        fecha: (c[0] ?? '').trim(),
        hora: (c[1] ?? '').trim(),
        tipo,
        ventana: (c[3] ?? '').trim(),
        bateriaPct: parsearNumero(c[4] ?? ''),
        autonomiaKm: parsearNumero(c[5] ?? ''),
        consumoWhKm: parsearNumero(c[6] ?? ''),
        energiaKwh: parsearNumero(c[7] ?? ''),
        presionPsi: parsearNumero(c[8] ?? ''),
        tempC: parsearNumero(c[9] ?? ''),
        modo: (c[10] ?? '').trim(),
        notas: (c[11] ?? '').trim(),
      })
    } catch (e) {
      resultado.errores.push(`Línea ${numeroLinea}: ${(e as Error).message}.`)
    }
  })

  return resultado
}

function celda(valor: string | number | null): string {
  if (valor === null || valor === '') return ''
  const texto = typeof valor === 'number' ? String(valor).replace('.', ',') : valor
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/** Serializa mediciones al mismo formato del CSV de línea base. */
export function serializarCsv(mediciones: Medicion[]): string {
  const filas = mediciones.map((m) =>
    [
      celda(m.fecha),
      celda(m.hora),
      celda(ETIQUETA_TIPO[m.tipo]),
      celda(m.ventana),
      celda(m.bateriaPct),
      celda(m.autonomiaKm),
      celda(m.consumoWhKm),
      celda(m.energiaKwh),
      celda(m.presionPsi),
      celda(m.tempC),
      celda(m.modo),
      celda(m.notas),
    ].join(SEPARADOR),
  )
  return [CABECERA_CSV.join(SEPARADOR), ...filas].join('\n') + '\n'
}
