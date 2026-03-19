// ─────────────────────────────────────────────────────────────────────────────
// eva-suggestions.js
// Sugerencias de autocomplete (input) + follow-ups contextuales (post-respuesta)
// ─────────────────────────────────────────────────────────────────────────────

export const EVA_BASE_SUGGESTIONS = [
  { id: 's1', label: 'Resumen diario',   prompt: 'resumen diario',          icon: 'summarize'  },
  { id: 's2', label: 'Alertas abiertas', prompt: 'alertas abiertas',        icon: 'warning'    },
  { id: 's3', label: 'Tendencias',       prompt: 'tendencias',              icon: 'insights'   },
  { id: 's4', label: 'Gráfica TICKETS',  prompt: 'grafica tickets',         icon: 'show_chart' },
  { id: 's5', label: 'Gráfica Lector',   prompt: 'grafica lector',          icon: 'show_chart' },
  { id: 's6', label: 'TRUSTVALUE 30d',   prompt: 'grafica trustvalue 30d',  icon: 'timeline'   },
  { id: 's7', label: 'TICKETS 72h',      prompt: 'grafica tickets 72h',     icon: 'timeline'   }
]

// ── Autocomplete mientras el usuario escribe ──────────────────────────────────

export function getEvaSuggestions(input) {
  const text = (input || '').trim().toLowerCase()

  if (!text) return EVA_BASE_SUGGESTIONS.slice(0, 5)

  const suggestions = EVA_BASE_SUGGESTIONS.filter(item =>
    item.label.toLowerCase().includes(text) ||
    item.prompt.toLowerCase().includes(text)
  )

  if (suggestions.length) return suggestions.slice(0, 6)

  if (text.includes('graf') || text.includes('chart')) {
    return [
      { id: 'g1', label: 'Gráfica TICKETS',       prompt: 'grafica tickets',        icon: 'show_chart' },
      { id: 'g2', label: 'Gráfica Lector',         prompt: 'grafica lector',         icon: 'show_chart' },
      { id: 'g3', label: 'Gráfica TRUSTVALUE 30d', prompt: 'grafica trustvalue 30d', icon: 'timeline'   }
    ]
  }
  if (text.includes('alert')) return [{ id: 'a1', label: 'Alertas abiertas', prompt: 'alertas abiertas', icon: 'warning'   }]
  if (text.includes('resum')) return [{ id: 'r1', label: 'Resumen diario',   prompt: 'resumen diario',   icon: 'summarize' }]
  if (text.includes('tend'))  return [{ id: 't1', label: 'Tendencias',       prompt: 'tendencias',       icon: 'insights'  }]

  return []
}

// ── Follow-ups contextuales post-respuesta ────────────────────────────────────
//
// Se generan DESPUÉS de que Eva responde, basados en:
//   - action    : qué acción acaba de ejecutarse
//   - context   : { system, granularity, days, hours, availableSystems }
//
// Reglas:
//   • Máx 3 sugerencias por respuesta
//   • Nunca repetir la acción que acaba de hacerse
//   • Si hay sistema activo, ofrecer variaciones del mismo sistema
//   • Si no hay sistema, ofrecer cambiar a otro sistema

export function getContextualFollowUps(action, context = {}) {
  const {
    system           = null,
    granularity      = 'daily',
    days             = 30,
    hours            = 24,
    availableSystems = []
  } = context

  const sys     = system || null
  const sysName = sys ? sys : null

  // Sistemas alternativos (excluir el actual, máx 2)
  const otherSystems = availableSystems
    .map(s => (typeof s === 'string' ? s : s?.name))
    .filter(Boolean)
    .filter(s => s !== sysName)
    .slice(0, 2)

  switch (action) {

    // ── Después de ver el resumen diario ───────────────────────────────────
    case 'daily-summary':
      return compact([
        sysName && {
          id: 'fu-chart-sys',
          label: `Gráfica de ${sysName}`,
          prompt: `grafica ${sysName.toLowerCase()}`,
          icon: 'show_chart'
        },
        {
          id: 'fu-alerts',
          label: 'Ver alertas abiertas',
          prompt: 'alertas abiertas',
          icon: 'warning'
        },
        {
          id: 'fu-trends',
          label: 'Ver tendencias',
          prompt: 'tendencias',
          icon: 'insights'
        }
      ])

    // ── Después de ver una gráfica ─────────────────────────────────────────
    case 'metrics-chart': {
      const isHourly = granularity === 'hourly'
      const followUps = []

      // Cambiar granularidad
      if (isHourly) {
        followUps.push({
          id: 'fu-daily',
          label: sysName ? `${sysName} — últimos ${days}d` : `Ver últimos ${days} días`,
          prompt: sysName
            ? `grafica ${sysName.toLowerCase()} ${days}d`
            : `grafica ${days}d`,
          icon: 'calendar_today'
        })
      } else {
        followUps.push({
          id: 'fu-hourly',
          label: sysName ? `${sysName} — últimas ${hours}h` : `Ver últimas ${hours}h`,
          prompt: sysName
            ? `grafica ${sysName.toLowerCase()} ${hours}h`
            : `grafica ${hours}h`,
          icon: 'schedule'
        })
      }

      // Sistema alternativo
      if (otherSystems[0]) {
        followUps.push({
          id: 'fu-other-sys',
          label: `Comparar con ${otherSystems[0]}`,
          prompt: `grafica ${otherSystems[0].toLowerCase()}`,
          icon: 'compare_arrows'
        })
      }

      // Resumen del sistema
      followUps.push({
        id: 'fu-summary',
        label: 'Resumen ejecutivo',
        prompt: 'resumen diario',
        icon: 'summarize'
      })

      return followUps.slice(0, 3)
    }

    // ── Después de ver alertas ─────────────────────────────────────────────
    case 'open-alerts':
      return compact([
        sysName && {
          id: 'fu-chart-alert',
          label: `Gráfica de ${sysName}`,
          prompt: `grafica ${sysName.toLowerCase()}`,
          icon: 'show_chart'
        },
        {
          id: 'fu-summary-alert',
          label: 'Resumen del día',
          prompt: 'resumen diario',
          icon: 'summarize'
        },
        {
          id: 'fu-trends-alert',
          label: 'Ver tendencias',
          prompt: 'tendencias',
          icon: 'insights'
        }
      ])

    // ── Después de ver tendencias ──────────────────────────────────────────
    case 'trends':
      return compact([
        sysName && {
          id: 'fu-chart-trend',
          label: `Gráfica de ${sysName}`,
          prompt: `grafica ${sysName.toLowerCase()}`,
          icon: 'show_chart'
        },
        !sysName && otherSystems[0] && {
          id: 'fu-chart-first',
          label: `Gráfica de ${otherSystems[0]}`,
          prompt: `grafica ${otherSystems[0].toLowerCase()}`,
          icon: 'show_chart'
        },
        {
          id: 'fu-alerts-trend',
          label: 'Alertas abiertas',
          prompt: 'alertas abiertas',
          icon: 'warning'
        },
        {
          id: 'fu-summary-trend',
          label: 'Resumen ejecutivo',
          prompt: 'resumen diario',
          icon: 'summarize'
        }
      ])

    default:
      return [
        { id: 'fu-def-1', label: 'Resumen diario',   prompt: 'resumen diario',  icon: 'summarize'  },
        { id: 'fu-def-2', label: 'Alertas abiertas', prompt: 'alertas abiertas', icon: 'warning'   },
        { id: 'fu-def-3', label: 'Tendencias',       prompt: 'tendencias',       icon: 'insights'  }
      ]
  }
}

// ── helper: quita nulls y limita a 3 ─────────────────────────────────────────
function compact(arr) {
  return arr.filter(Boolean).slice(0, 3)
}