import { useCallback, useMemo, useState } from 'react'
import { LINEA_BASE } from '../domain/lineaBase'
import type { Medicion } from '../domain/medicion'
import {
  cargarChecklist,
  cargarMedicionesPropias,
  guardarChecklist,
  guardarMedicionesPropias,
} from '../storage/repositorio'

export function useAlmacen() {
  const [propias, setPropias] = useState<Medicion[]>(() => cargarMedicionesPropias())
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => cargarChecklist())
  const [persistenciaOk, setPersistenciaOk] = useState(true)

  const todas = useMemo(() => [...LINEA_BASE, ...propias], [propias])

  const reemplazarPropias = useCallback((nuevas: Medicion[]) => {
    setPropias(nuevas)
    setPersistenciaOk(guardarMedicionesPropias(nuevas))
  }, [])

  const agregar = useCallback(
    (m: Medicion) => reemplazarPropias([...propias, m]),
    [propias, reemplazarPropias],
  )

  const eliminar = useCallback(
    (id: string) => reemplazarPropias(propias.filter((m) => m.id !== id)),
    [propias, reemplazarPropias],
  )

  const marcar = useCallback(
    (id: string, valor: boolean) => {
      const siguiente = { ...checklist, [id]: valor }
      setChecklist(siguiente)
      if (!guardarChecklist(siguiente)) setPersistenciaOk(false)
    },
    [checklist],
  )

  return { todas, propias, agregar, eliminar, reemplazarPropias, checklist, marcar, persistenciaOk }
}

export type Almacen = ReturnType<typeof useAlmacen>
