import { describe, expect, it } from 'vitest'
import { CABECERA_CSV, dividirLinea, parsearCsv, parsearNumero, serializarCsv } from './csv'
import { LINEA_BASE } from './lineaBase'
import type { Medicion } from './medicion'

const idsFijos = () => {
  let n = 0
  return () => `id-${++n}`
}

const CSV_LINEA_BASE = [
  CABECERA_CSV.join(';'),
  '01-nov;06:40;Línea base;Últimos 15 km;72;212;208,7;3,1;;20;Relax;Foto 18.13.04',
  '01-nov;06:40;Línea base;Últimos 150 km;72;225;196,8;29,5;;20;Relax;Foto 18.13.04 (1)',
  '01-nov;06:40;Línea base;Últimos 300 km;72;252;175,6;52,7;;20;Relax;Foto 18.13.05',
  '01-nov;~06:30;Línea base;Desde la carga (57,2 km);72;;170,1;9,7;;20;Relax;Foto 18.13.07. 16,6 % consumido',
  '01-nov;20:44;Línea base;Últimos 150 km;47;156;187,2;28,1;;22;Relax;Foto 18.13.08',
  '01-nov;20:44;Línea base;Desde la carga (139 km);47;;186,7;25,9;;22;Relax;Foto 18.13.07 (3)',
  '01-nov;20:44;Línea base;Casa-colegio (126,5 km);47;;179,4;22,7;;22;Relax;Foto 18.13.07 (3). Trayecto repetible',
  '01-nov;20:44;Línea base;Casa (13 km);47;;194,7;2,5;;22;Relax;Foto 18.13.07 (3). Trayecto repetible',
  ';;Medición;Casa-colegio (ida y vuelta);;;;;42;;;Llantas a 42 psi en frío',
].join('\n')

describe('parsearNumero', () => {
  it('acepta decimal con coma', () => {
    expect(parsearNumero('208,7')).toBe(208.7)
  })
  it('devuelve null para vacío', () => {
    expect(parsearNumero('  ')).toBeNull()
  })
  it('lanza error con texto inválido', () => {
    expect(() => parsearNumero('abc')).toThrow()
  })
})

describe('dividirLinea', () => {
  it('respeta campos entre comillas con separador dentro', () => {
    expect(dividirLinea('a;"b;c";d')).toEqual(['a', 'b;c', 'd'])
  })
  it('respeta comillas escapadas', () => {
    expect(dividirLinea('"dice ""hola""";x')).toEqual(['dice "hola"', 'x'])
  })
})

describe('parsearCsv', () => {
  it('lee la línea base completa sin errores', () => {
    const { mediciones, errores } = parsearCsv(CSV_LINEA_BASE, idsFijos())
    expect(errores).toEqual([])
    expect(mediciones).toHaveLength(9)
    expect(mediciones[0]).toMatchObject({
      fecha: '01-nov',
      hora: '06:40',
      tipo: 'linea_base',
      ventana: 'Últimos 15 km',
      bateriaPct: 72,
      autonomiaKm: 212,
      consumoWhKm: 208.7,
      energiaKwh: 3.1,
      tempC: 20,
      modo: 'Relax',
    })
  })

  it('lee las filas de medición vacías sin inventar valores', () => {
    const { mediciones } = parsearCsv(CSV_LINEA_BASE, idsFijos())
    const plantilla = mediciones[8]
    expect(plantilla.tipo).toBe('medicion')
    expect(plantilla.consumoWhKm).toBeNull()
    expect(plantilla.presionPsi).toBe(42)
  })

  it('reporta líneas con tipo desconocido sin detener la lectura', () => {
    const csv = [CABECERA_CSV.join(';'), '01-nov;06:40;Otra cosa;x;72;;;;;;;'].join('\n')
    const { mediciones, errores } = parsearCsv(csv, idsFijos())
    expect(mediciones).toHaveLength(0)
    expect(errores[0]).toContain('tipo desconocido')
  })

  it('rechaza una cabecera distinta', () => {
    const { errores } = parsearCsv('Foo;Bar\n1;2', idsFijos())
    expect(errores[0]).toContain('cabecera')
  })
})

describe('serializarCsv', () => {
  it('reproduce la línea base exacta al volver a serializarla', () => {
    const { mediciones } = parsearCsv(CSV_LINEA_BASE, idsFijos())
    expect(serializarCsv(mediciones).trimEnd()).toBe(CSV_LINEA_BASE)
  })

  it('exporta e importa sin pérdida', () => {
    const original: Medicion[] = LINEA_BASE.map((m) => ({ ...m }))
    const { mediciones, errores } = parsearCsv(serializarCsv(original), idsFijos())
    expect(errores).toEqual([])
    const sinIds = (lista: Medicion[]) => lista.map(({ id: _id, ...resto }) => resto)
    expect(sinIds(mediciones)).toEqual(sinIds(original))
  })

  it('escapa notas con separador y comillas', () => {
    const m: Medicion = {
      ...LINEA_BASE[0],
      id: 'x',
      tipo: 'medicion',
      notas: 'dijo "ok"; luego',
    }
    const texto = serializarCsv([m])
    const { mediciones } = parsearCsv(texto, idsFijos())
    expect(mediciones[0].notas).toBe('dijo "ok"; luego')
  })
})
