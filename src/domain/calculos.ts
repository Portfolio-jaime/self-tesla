/**
 * Energía por kilómetro en Wh/km a partir de kWh y km.
 * Devuelve null si los datos no permiten calcularlo.
 */
export function wattHoraPorKm(energiaKwh: number, km: number): number | null {
  if (!Number.isFinite(energiaKwh) || !Number.isFinite(km) || km <= 0) return null
  return (energiaKwh * 1000) / km
}

/** Diferencia porcentual de `nuevo` frente a `base`. Positiva = más consumo. */
export function diferenciaPct(nuevo: number, base: number): number | null {
  if (!Number.isFinite(nuevo) || !Number.isFinite(base) || base === 0) return null
  return ((nuevo - base) / base) * 100
}

/** Autonomía con batería al 100 % según capacidad útil y consumo. */
export function autonomiaAl100(capacidadKwh: number, consumoWhKm: number): number | null {
  if (!Number.isFinite(capacidadKwh) || !Number.isFinite(consumoWhKm) || consumoWhKm <= 0) {
    return null
  }
  return (capacidadKwh * 1000) / consumoWhKm
}

/**
 * Capacidad útil estimada a partir de una lectura del auto:
 * energía restante = autonomía × consumo, y eso dividido entre el porcentaje de batería.
 */
export function capacidadUtilEstimadaKwh(
  bateriaPct: number,
  autonomiaKm: number,
  consumoWhKm: number,
): number | null {
  if (bateriaPct <= 0 || autonomiaKm <= 0 || consumoWhKm <= 0) return null
  const energiaRestanteKwh = (autonomiaKm * consumoWhKm) / 1000
  return energiaRestanteKwh / (bateriaPct / 100)
}
