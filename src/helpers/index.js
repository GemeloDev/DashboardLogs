const formatearFecha = (fecha) => {

  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };

  if (!fecha) return 'No disponible'
  try {
    return new Date(fecha).toLocaleString('es-ES', opciones)
  } catch {
    return fecha
  }
}

const timeAgoIntl = (dateString, locale = 'es', emptyLabel = 'Nunca') => {
  if (!dateString) return emptyLabel

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return emptyLabel

  const now = new Date()
  const diffInSeconds = (date - now) / 1000

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  // Definir cortes
  const cutoffs = [
    { amount: 60, unit: 'seconds' },
    { amount: 60, unit: 'minutes' },
    { amount: 24, unit: 'hours' },
    { amount: 7, unit: 'days' },
    { amount: 4.34524, unit: 'weeks' },
    { amount: 12, unit: 'months' },
    { amount: Number.POSITIVE_INFINITY, unit: 'years' }
  ]

  let duration = diffInSeconds

  for (const { amount, unit } of cutoffs) {
    if (Math.abs(duration) < amount) {
      return rtf.format(Math.round(duration), unit)
    }
    duration /= amount
  }
}

const formatWithUnderscores = (text) => text.trim().replace(/\s+/g, '_');

// Versión defensiva: acepta string o array
const formatArrayWithUnderscores = (value) => {
  const arr = Array.isArray(value) ? value : [value];
  return arr.map(formatWithUnderscores);
};

export {
  formatearFecha,
  timeAgoIntl,
  formatWithUnderscores,
  formatArrayWithUnderscores
}
