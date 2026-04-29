import * as XLSX from 'xlsx'

export class ConsoleExportService {
  static geetDeep(obj, path) {
    return String(path || '')
      .split('.')
      .reduce((o, k) => (o ? o[k] : null), obj)
  }

  static safe(v) {
    return v === null || v === undefined ? '' : String(v)
  }

  static buildRows(logs = []) {
    return (Array.isArray(logs) ? logs : []).map((log) => ({
      eventTime:       this.safe(log?.eventTime),
      eventType:       this.safe(log?.eventType),
      eventCode:       this.safe(log?.eventCode),
      status:          this.safe(log?.status),
      outcome:         this.safe(log?.outcome),
      severity:        this.safe(log?.severity),
      system:          this.safe(log?.system),
      caseId:          this.safe(log?.caseId),
      message:         this.safe(log?.message),
      'actor.id':      this.safe(this.geetDeep(log, 'actor.id')),
      'actor.type':    this.safe(this.geetDeep(log, 'actor.type')),
      'actor.fullName':this.safe(this.geetDeep(log, 'actor.fullName')),
      'meta.ip':       this.safe(this.geetDeep(log, 'meta.ip')),
      'meta.deviceId': this.safe(this.geetDeep(log, 'meta.deviceId')),
      'meta.channel':  this.safe(this.geetDeep(log, 'meta.channel')),
    }))
  }

  static downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Excel ─────────────────────────────────────────────────────────────────
  static exportExcel(logs, filenameBase = 'logs-consola') {
    const rows = this.buildRows(logs)
    if (!rows.length) throw new Error('No hay registros para exportar')

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false })

    const headers = Object.keys(rows[0] || {})
    ws['!cols'] = headers.map((h) => ({
      wch: Math.min(60, Math.max(12, h.length + 2))
    }))

    XLSX.utils.book_append_sheet(wb, ws, 'Logs')
    XLSX.writeFile(wb, `${filenameBase}-${Date.now()}.xlsx`)
  }

  // ── CSV ───────────────────────────────────────────────────────────────────
  static exportCSV(logs, filenameBase = 'logs-consola') {
    const rows = this.buildRows(logs)
    if (!rows.length) throw new Error('No hay registros para exportar')

    const headers = Object.keys(rows[0])

    // Escapar campo CSV: si contiene coma, comilla o salto de línea → envolver en comillas
    const escapeField = (val) => {
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }

    const headerLine = headers.map(escapeField).join(',')
    const dataLines  = rows.map((row) =>
      headers.map((h) => escapeField(row[h])).join(',')
    )

    // BOM UTF-8 para que Excel lo abra correctamente con acentos
    const bom     = '\uFEFF'
    const content = bom + [headerLine, ...dataLines].join('\r\n')

    this.downloadBlob(
      content,
      `${filenameBase}-${Date.now()}.csv`,
      'text/csv;charset=utf-8'
    )
  }

  // ── JSON ──────────────────────────────────────────────────────────────────
  static exportJSON(logs, filenameBase = 'logs-consola') {
    const items = Array.isArray(logs) ? logs : []
    if (!items.length) throw new Error('No hay registros para exportar')

    const safeItems = items.map((x) => JSON.parse(JSON.stringify(x)))
    const json = JSON.stringify(safeItems, null, 2)

    this.downloadBlob(
      json,
      `${filenameBase}-${Date.now()}.json`,
      'application/json;charset=utf-8'
    )
  }

  // ── TXT ───────────────────────────────────────────────────────────────────
  static exportTXT(logs, filenameBase = 'logs-consola') {
    const rows = this.buildRows(logs)
    if (!rows.length) throw new Error('No hay registros para exportar')

    const txt = rows
      .map((r) =>
        [
          r.eventTime,
          r.eventType,
          r.status,
          r['actor.fullName'],
          r['meta.deviceId'],
          r.message?.replace(/\s+/g, ' '),
        ].join(' | ')
      )
      .join('\n')

    this.downloadBlob(
      txt,
      `${filenameBase}-${Date.now()}.txt`,
      'text/plain;charset=utf-8'
    )
  }
}

export default ConsoleExportService
