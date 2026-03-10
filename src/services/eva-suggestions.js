export const EVA_BASE_SUGGESTIONS = [
  { id: 's1', label: 'Resumen diario', prompt: 'resumen diario', icon: 'summarize' },
  { id: 's2', label: 'Alertas abiertas', prompt: 'alertas abiertas', icon: 'warning' },
  { id: 's3', label: 'Tendencias', prompt: 'tendencias', icon: 'insights' },
  { id: 's4', label: 'Gráfica TICKETS', prompt: 'grafica tickets', icon: 'show_chart' },
  { id: 's5', label: 'Gráfica Lector', prompt: 'grafica lector', icon: 'show_chart' },
  { id: 's6', label: 'TRUSTVALUE 30d', prompt: 'grafica trustvalue 30d', icon: 'timeline' },
  { id: 's7', label: 'TICKETS 72h', prompt: 'grafica tickets 72h', icon: 'timeline' }
]

export function getEvaSuggestions(input) {
  const text = (input || '').trim().toLowerCase()

  if (!text) {
    return EVA_BASE_SUGGESTIONS.slice(0, 5)
  }

  const suggestions = EVA_BASE_SUGGESTIONS.filter(item => {
    return (
      item.label.toLowerCase().includes(text) ||
      item.prompt.toLowerCase().includes(text)
    )
  })

  if (suggestions.length) {
    return suggestions.slice(0, 6)
  }

  if (text.includes('graf') || text.includes('chart')) {
    return [
      { id: 'g1', label: 'Gráfica TICKETS', prompt: 'grafica tickets', icon: 'show_chart' },
      { id: 'g2', label: 'Gráfica Lector', prompt: 'grafica lector', icon: 'show_chart' },
      { id: 'g3', label: 'Gráfica TRUSTVALUE 30d', prompt: 'grafica trustvalue 30d', icon: 'timeline' }
    ]
  }

  if (text.includes('alert')) {
    return [
      { id: 'a1', label: 'Alertas abiertas', prompt: 'alertas abiertas', icon: 'warning' }
    ]
  }

  if (text.includes('resum')) {
    return [
      { id: 'r1', label: 'Resumen diario', prompt: 'resumen diario', icon: 'summarize' }
    ]
  }

  if (text.includes('tend')) {
    return [
      { id: 't1', label: 'Tendencias', prompt: 'tendencias', icon: 'insights' }
    ]
  }

  return []
}