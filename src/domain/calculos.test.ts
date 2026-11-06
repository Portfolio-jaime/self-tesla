import { describe, expect, it } from 'vitest'
import {
  autonomiaAl100,
  capacidadUtilEstimadaKwh,
  diferenciaPct,
  wattHoraPorKm,
} from './calculos'

describe('wattHoraPorKm', () => {
  it('convierte kWh y km en Wh/km', () => {
    expect(wattHoraPorKm(22.7, 126.5)).toBeCloseTo(179.4, 1)
  })

  it('devuelve null si los km no son positivos', () => {
    expect(wattHoraPorKm(3, 0)).toBeNull()
    expect(wattHoraPorKm(3, -5)).toBeNull()
  })

  it('devuelve null con valores no numéricos', () => {
    expect(wattHoraPorKm(Number.NaN, 10)).toBeNull()
  })
})

describe('diferenciaPct', () => {
  it('es positiva cuando el nuevo valor es mayor', () => {
    expect(diferenciaPct(190, 179.4)).toBeCloseTo(5.91, 1)
  })

  it('es negativa cuando baja el consumo', () => {
    expect(diferenciaPct(170, 180)).toBeCloseTo(-5.56, 1)
  })

  it('devuelve null si la base es cero', () => {
    expect(diferenciaPct(10, 0)).toBeNull()
  })
})

describe('autonomiaAl100', () => {
  it('calcula km con batería llena', () => {
    // 61,5 kWh a 197 Wh/km ≈ 312 km
    expect(autonomiaAl100(61.5, 197)).toBeCloseTo(312.2, 0)
  })
})

describe('capacidadUtilEstimadaKwh', () => {
  it('reproduce la estimación de las fotos (72 % con 212 km a 208,7 Wh/km)', () => {
    // 212 × 0,2087 ≈ 44,2 kWh restantes; 44,2 / 0,72 ≈ 61,5 kWh
    expect(capacidadUtilEstimadaKwh(72, 212, 208.7)).toBeCloseTo(61.45, 1)
  })

  it('devuelve null sin batería', () => {
    expect(capacidadUtilEstimadaKwh(0, 212, 208.7)).toBeNull()
  })
})
