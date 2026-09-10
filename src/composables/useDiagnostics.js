function localDateFromYmd(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export const DIAGNOSTICS_REQUEST_TIMEOUT = 10000

export function getIsoDateRange(tabKey, selectedRange = {}) {
  const now = new Date()
  const key = String(tabKey || 'today').toLowerCase()

  if (key === 'custom') {
    const from = localDateFromYmd(selectedRange.from) || new Date(0)
    const to = localDateFromYmd(selectedRange.to) || now
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }

  let from = new Date(now)
  if (['7d', 'last7days'].includes(key)) from.setDate(now.getDate() - 7)
  else if (['30d', 'last30days'].includes(key)) from.setDate(now.getDate() - 30)
  else if (['all', 'historico', 'histórico'].includes(key)) from = new Date(0)
  else from.setHours(0, 0, 0, 0)

  return { from: from.toISOString(), to: now.toISOString() }
}

export function buildSearchParams(fromIso, toIso, systemCode = null) {
  const params = new URLSearchParams()
  if (fromIso) {
    params.append('from', fromIso)
    params.append('startDate', fromIso)
  }
  if (toIso) {
    params.append('to', toIso)
    params.append('endDate', toIso)
  }
  if (systemCode) params.append('system', systemCode)
  return params
}

export function useDiagnostics() {
  return { getIsoDateRange, buildSearchParams, requestTimeout: DIAGNOSTICS_REQUEST_TIMEOUT }
}
