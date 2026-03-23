import { useEvaStore } from 'src/stores/eva-store'

// Sugerencias base que no dependen del sistema — siempre visibles
const BASE_SUGGESTIONS = [
  { id: 's1', label: 'Resumen diario',   prompt: 'resumen diario',   icon: 'summarize' },
  { id: 's2', label: 'Alertas abiertas', prompt: 'alertas abiertas', icon: 'warning'   },
  { id: 's3', label: 'Tendencias',       prompt: 'tendencias',       icon: 'insights'  },
]

/**
 * Genera sugerencias dinámicamente según los sistemas del usuario.
 * Los botones de gráficas solo muestran los sistemas que el usuario puede ver.
 */
export function getEvaSuggestions(input = '') {
  const eva  = useEvaStore()
  const text = input.trim().toLowerCase()

  // Generar sugerencias de gráficas por cada system disponible del usuario
  const systemSuggestions = (eva.availableSystem || [])
    .slice(0, 4)
    .map((item, idx) => {
      const name = typeof item === 'string' ? item : item?.name
      if (!name) return null
      const label = name.length > 12 ? name.slice(0, 12) + '…' : name
      return {
        id:     `sys-${idx}`,
        label:  `Gráfica ${label}`,
        prompt: `grafica ${name.toLowerCase()}`,
        icon:   'show_chart',
        system: name
      }
    })
    .filter(Boolean)

  const allSuggestions = [...BASE_SUGGESTIONS, ...systemSuggestions]

  if (!text) return allSuggestions.slice(0, 6)

  const filtered = allSuggestions.filter(s =>
    s.label.toLowerCase().includes(text) ||
    s.prompt.toLowerCase().includes(text)
  )

  if (filtered.length) return filtered.slice(0, 6)

  if (text.includes('graf') || text.includes('chart')) {
    return systemSuggestions.length
      ? systemSuggestions
      : [{ id: 'g0', label: 'Gráfica por system', prompt: 'grafica', icon: 'show_chart' }]
  }

  if (text.includes('alert'))  return [BASE_SUGGESTIONS[1]]
  if (text.includes('resum'))  return [BASE_SUGGESTIONS[0]]
  if (text.includes('tend'))   return [BASE_SUGGESTIONS[2]]

  return []
}
