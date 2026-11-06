/** Los 8 puntos de docs/guia-configuracion.md (checklist de la sección 7). */
export interface ItemChecklist {
  id: string
  texto: string
}

export const CHECKLIST: readonly ItemChecklist[] = [
  { id: 'modo-relax', texto: 'Modo Relax para ciudad' },
  { id: 'regeneracion', texto: 'Regeneración en Estándar / Normal (o la opción más fuerte)' },
  { id: 'hold', texto: 'Hold activado; Arrastre y Rodar desactivados si aparecen' },
  { id: 'clima', texto: 'Clima en 21 °C y Automático' },
  { id: 'vigilancia', texto: 'Centinela, Dog Mode y Campamento apagados si no se usan' },
  { id: 'llantas', texto: 'Llantas a 42 psi en frío' },
  { id: 'supercargador', texto: 'Navegación al Supercargador desde el auto' },
  { id: 'carga-100', texto: '100 % una vez por semana (LFP)' },
]
