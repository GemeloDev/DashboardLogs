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
      eventTime: this.safe(log?.eventTime),
      eventType: this.safe(log?.eventType),
      status: this.safe(log?.status),
      message: this.safe(log?.message),
      'actor.fullname': this.safe(this.geetDeep(log, 'actor.fullName')),
      'meta.device': this.safe(this.geetDeep(log, 'meta.device')),
    }))
  }

  static downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  //  Excel
  static exportExcel(logs, filenameBase = 'logs-consola') {
    const rows = this.buildRows(logs)
    if (!rows.length) throw new Error('No hay registros para exportar')

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false })

    const headers = Object.keys(rows[0] || {})
    ws['!cols'] = headers.map((h) => ({ wch: Math.min(60, Math.max(12, h.length + 2)) }))

    XLSX.utils.book_append_sheet(wb, ws, 'Logs')
    XLSX.writeFile(wb, `${filenameBase}-${Date.now()}.xlsx`)
  }

  //  JSON
  static exportJSON(logs, filenameBase = 'logs-consola') {
    const items = Array.isArray(logs) ? logs : []
    if (!items.length) throw new Error('No hay registros para exportar')

    // (Opcional) Asegura JSON “limpio” (quita undefined, fechas como string, etc.)
    // Si tus logs ya son planos, esto está perfecto.
    const safeItems = items.map((x) => JSON.parse(JSON.stringify(x)))

    const json = JSON.stringify(safeItems, null, 2)
    this.downloadBlob(json, `${filenameBase}-${Date.now()}.json`, 'application/json;charset=utf-8')
  }

  //  TXT (.txt)
  static exportTXT(logs, filenameBase = 'logs-consola') {
    const rows = this.buildRows(logs)
    if (!rows.length) throw new Error('No hay registros para exportar')

    const txt = rows
      .map((r) => {
        // formato legible por línea
        return [
          r.eventTime,
          r.eventType,
          r.status,
          r['actor.fullName'],
          r['meta.device'],
          r.message?.replace(/\s+/g, ' '), // compacta saltos
        ].join(' | ')
      })
      .join('\n')

    this.downloadBlob(txt, `${filenameBase}-${Date.now()}.txt`, 'text/plain;charset=utf-8')
  }
}

export default ConsoleExportService
