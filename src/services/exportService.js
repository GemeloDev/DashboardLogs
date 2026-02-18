import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export class ExportService {
  // Helpers mínimos (solo lo que usa exportSession)
  static formatearFecha(fecha) {
    if (!fecha) return 'No disponible'
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return fecha.toString()
    }
  }

  static truncarTexto(texto, maxLength = 50) {
    if (!texto) return ''
    const textoLimpio = texto.toString().replace(/[^\w\s\-.,]/g, '')
    return textoLimpio.length > maxLength
      ? textoLimpio.substring(0, maxLength) + '...'
      : textoLimpio
  }

  // ✅ ÚNICO export público
  static async exportSession(datos, formato) {
    try {
      if (!datos || !Array.isArray(datos) || datos.length === 0) {
        throw new Error('No hay datos de sesión para exportar')
      }

      const eventosOrdenados = [...datos].sort(
        (a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime(),
      )

      const primero = eventosOrdenados[0]
      const ultimo = eventosOrdenados[eventosOrdenados.length - 1]

      const tokenFromOutcome = (primero?.outcome || '').split('-')[0]

      const sessionToken =
        datos.summary?.sessionToken || primero?.requestId || tokenFromOutcome || 'N/A'

      const baseCode = datos.summary?.baseCode || primero?.eventType || 'N/A'

      const datosParaExportar = {
        sessionToken,
        baseCode,

        usuario: primero?.actorFullName || datos.summary?.user || 'N/A',
        actorId: primero?.actorId || 'N/A',
        curp: datos.summary?.curp || 'N/A',

        fechaInicio: this.formatearFecha?.(primero?.eventTime) ?? primero?.eventTime,
        fechaFin: this.formatearFecha?.(ultimo?.eventTime) ?? ultimo?.eventTime,

        oficina: primero?.locationName || datos.summary?.office || 'N/A',
        dispositivo: datos.summary?.device || 'N/A',

        totalRegistros: eventosOrdenados.length,

        // Timeline
        eventos: eventosOrdenados.map((ev) => ({
          id: ev.id,
          eventTime: ev.eventTime,
          eventType: ev.eventType,
          status: ev.status,
          severity: ev.severity,
          outcome: ev.outcome,
          message: this.truncarTexto ? this.truncarTexto(ev.message, 220) : ev.message,

          actorId: ev.actorId,
          actorUsername: ev.actorUsername,
          actorFullName: ev.actorFullName,

          locationId: ev.locationId,
          locationName: ev.locationName,

          requestId: ev.requestId,
          geoCoordinates: ev.geoCoordinates,
          geoAccuracyMeters: ev.geoAccuracyMeters,
        })),

        // Backward compatible
        actividades: eventosOrdenados.map((ev) => ({
          fecha: this.formatearFecha?.(ev.eventTime) ?? ev.eventTime,
          tipo: ev.eventType || 'N/A',
          proceso: ev.status || 'N/A',
          errorCode: ev.outcome || 'N/A',
          mensaje: this.truncarTexto ? this.truncarTexto(ev.message, 100) : ev.message,
        })),
      }

      switch ((formato || '').toLowerCase()) {
        case 'pdf':
          return this.exportarSesionPDF(datosParaExportar)
        case 'excel':
          return this.exportarSesionExcel(datosParaExportar)
        case 'json':
          return this.exportarSesionJSON(datosParaExportar)
        default:
          throw new Error('Formato no soportado')
      }
    } catch (error) {
      console.error('Error en exportSession:', error)
      throw error
    }
  }

  // ====== Implementaciones SOLO para sesión ======

  static exportarSesionPDF(datos) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const marginX = 15
    const marginY = 15

    const nowStr = new Date().toLocaleString('es-MX')

    const safe = (v, fallback = 'N/A') =>
      v === null || v === undefined || String(v).trim() === '' ? fallback : String(v)

    const fmtDate = (iso) => {
      try {
        if (!iso) return 'N/A'
        const d = new Date(iso)
        return d.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      } catch {
        return safe(iso)
      }
    }

    const colorBy = (ev) => {
      const status = (ev?.status || '').toUpperCase()
      const sev = (ev?.severity || '').toUpperCase()

      if (status === 'END') return [46, 204, 113]
      if (status === 'WARN' || sev === 'HIGH') return [243, 156, 18]
      if (status === 'INFO') return [41, 128, 185]
      return [127, 140, 141]
    }

    const addPageHeader = (isContinued = false) => {
      let y = 20
      doc.setFontSize(16)
      doc.text('REPORTE DE SESIÓN', marginX, y)
      y += 7

      doc.setFontSize(12)
      doc.text(isContinued ? 'Línea del tiempo (continuación)' : 'Línea del tiempo', marginX, y)
      y += 8

      doc.setFontSize(10)
      doc.text(`Fecha de generación: ${nowStr}`, marginX, y)
      return y + 6
    }

    let cursorY = addPageHeader(false)

    const totalEventos = Array.isArray(datos?.eventos) ? datos.eventos.length : 0

    const resumenTabla = [
      ['Campo', 'Valor'],
      ['Session Token', safe(datos?.sessionToken)],
      ['Código Base', safe(datos?.baseCode)],
      ['Usuario', safe(datos?.usuario)],
      ['Actor ID', safe(datos?.actorId)],
      ['Fecha Inicio', safe(datos?.fechaInicio)],
      ['Fecha Fin', safe(datos?.fechaFin)],
      ['Oficina', safe(datos?.oficina)],
      ['Dispositivo', safe(datos?.dispositivo)],
      ['Total Eventos', safe(datos?.totalRegistros ?? totalEventos)],
    ]

    autoTable(doc, {
      head: [resumenTabla[0]],
      body: resumenTabla.slice(1),
      startY: cursorY,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
      margin: { left: marginX, right: marginX },
    })

    cursorY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(13)
    doc.text('Eventos (orden cronológico):', marginX, cursorY)
    cursorY += 6

    const eventos = Array.isArray(datos?.eventos) ? [...datos.eventos] : []

    if (eventos.length === 0) {
      doc.setFontSize(10)
      doc.text('Sin eventos para mostrar.', marginX, cursorY)
    } else {
      eventos.sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())

      const xLine = marginX + 5
      const xBox = xLine + 7
      const boxW = pageW - xBox - marginX
      const circleR = 1.6

      let prevPointY = null

      const buildLines = (ev) => {
        const header = `${fmtDate(ev.eventTime)}  •  ${safe(ev.eventType)}  •  ${safe(ev.status)}  •  ${safe(ev.severity)}`
        const actor = `Actor: ${safe(ev.actorFullName)} (${safe(ev.actorId)})`
        const location = `Ubicación: ${safe(ev.locationName)}`
        const outcome = `Outcome: ${safe(ev.outcome)}`
        const req = ev.requestId ? `RequestId: ${safe(ev.requestId)}` : null

        const msg = safe(ev.message, '')
        let msgLines = doc.splitTextToSize(msg, boxW - 6)

        const MAX_MSG_LINES = 7
        if (msgLines.length > MAX_MSG_LINES) {
          msgLines = msgLines.slice(0, MAX_MSG_LINES)
          msgLines[MAX_MSG_LINES - 1] = msgLines[MAX_MSG_LINES - 1] + '…'
        }

        const lines = [header, actor, location, outcome]
        if (req) lines.push(req)

        if (msgLines.length > 0) {
          lines.push('Mensaje:')
          lines.push(...msgLines)
        }

        return lines
      }

      const ensureSpace = (neededH) => {
        if (cursorY + neededH > pageH - marginY) {
          doc.addPage()
          cursorY = addPageHeader(true)

          doc.setFontSize(13)
          doc.text('Eventos (orden cronológico):', marginX, cursorY)
          cursorY += 6

          prevPointY = null
        }
      }

      for (const ev of eventos) {
        const lines = buildLines(ev)
        const lineH = 4
        const padding = 4
        const boxH = padding + lines.length * lineH + 2

        ensureSpace(boxH + 10)

        const pointY = cursorY + 3
        const boxY = pointY - 6

        if (prevPointY !== null) {
          doc.setDrawColor(190)
          doc.setLineWidth(0.6)
          doc.line(xLine, prevPointY, xLine, pointY)
        }

        const [r, g, b] = colorBy(ev)
        doc.setFillColor(r, g, b)
        doc.setDrawColor(r, g, b)
        doc.circle(xLine, pointY, circleR, 'F')

        doc.setDrawColor(210)
        doc.setLineWidth(0.4)
        doc.roundedRect(xBox, boxY, boxW, boxH, 2, 2, 'S')

        doc.setFontSize(9)
        let textY = boxY + 6
        for (const ln of lines) {
          doc.text(String(ln), xBox + 3, textY)
          textY += lineH
        }

        prevPointY = pointY
        cursorY = boxY + boxH + 8
      }
    }

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(120)
      doc.text(`Página ${i} de ${pageCount}`, pageW - marginX, pageH - 10, { align: 'right' })
      doc.setTextColor(0)
    }

    doc.save(`sesion-${safe(datos?.sessionToken, 'N-A')}-${Date.now()}.pdf`)
  }

  static exportarSesionExcel(datos) {
    const workbook = XLSX.utils.book_new()

    const datosSesion = [
      ['Campo', 'Valor'],
      ['Session Token', datos.sessionToken],
      ['Codigo Base', datos.baseCode],
      ['Usuario', datos.usuario],
      ['CURP', datos.curp],
      ['Fecha Inicio', datos.fechaInicio],
      ['Fecha Fin', datos.fechaFin],
      ['Oficina', datos.oficina],
      ['Dispositivo', datos.dispositivo],
      ['Total Registros', datos.totalRegistros],
    ]

    const worksheetSesion = XLSX.utils.aoa_to_sheet(datosSesion)
    XLSX.utils.book_append_sheet(workbook, worksheetSesion, 'Sesion')

    if (datos.actividades && datos.actividades.length > 0) {
      const datosActividades = [
        ['Fecha', 'Tipo', 'Proceso', 'Error Code', 'Mensaje'],
        ...datos.actividades.map((act) => [
          act.fecha,
          act.tipo || 'N/A',
          act.proceso || 'N/A',
          act.errorCode || 'N/A',
          act.mensaje || 'N/A',
        ]),
      ]

      const worksheetActividades = XLSX.utils.aoa_to_sheet(datosActividades)
      XLSX.utils.book_append_sheet(workbook, worksheetActividades, 'Actividades')
    }

    XLSX.writeFile(workbook, `sesion-${datos.sessionToken}-${Date.now()}.xlsx`)
  }

  static exportarSesionJSON(datos) {
    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sesion-${datos.sessionToken}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * PDF: KPI + Charts
   */
  static exportConsoleChartsPDF({
    title = 'Reporte de Consola',
    subtitle = '',
    logs = [],
    charts = [], // [{ title, image, span? (1|2) }]
    filename = `reporte-graficas-${Date.now()}.pdf`,
  }) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const marginX = 12
    const marginY = 12
    const contentW = pageW - marginX * 2
    const nowStr = new Date().toLocaleString('es-MX')

    const safe = (v, fb = 'N/A') =>
      v === null || v === undefined || String(v).trim() === '' ? fb : String(v)

    const ensurePdfName = (name) =>
      String(name || '')
        .toLowerCase()
        .endsWith('.pdf')
        ? name
        : `${name}.pdf`

    const addHeader = (withSubtitle = false) => {
      let y = marginY
      doc.setFontSize(16)
      doc.text(safe(title), marginX, y)
      y += 7

      doc.setFontSize(10)
      doc.text(`Generado: ${nowStr}`, marginX, y)
      y += 5

      if (withSubtitle && subtitle) {
        doc.setFontSize(10)
        doc.text(safe(subtitle), marginX, y)
        y += 6
      }

      doc.setDrawColor(60)
      doc.setLineWidth(0.2)
      doc.line(marginX, y, pageW - marginX, y)
      return y + 6
    }

    const getRatio = (imgData) => {
      try {
        const p = doc.getImageProperties(imgData)
        const w = p?.width || 1
        const h = p?.height || 1
        return h / w
      } catch {
        return 0.6
      }
    }

    const fit = (imgData, targetW, maxH) => {
      const ratio = getRatio(imgData)
      let w = targetW
      let h = targetW * ratio
      if (h > maxH) {
        const s = maxH / h
        h = maxH
        w = w * s
      }
      return { w, h }
    }

    // ----- START -----
    let y = addHeader(true)

    // KPIs (usa tus helpers si existen)
    try {
      const kpis = typeof this._buildStatusKPIs === 'function' ? this._buildStatusKPIs(logs) : null

      if (kpis && typeof this._drawKpiRow === 'function') {
        y = this._drawKpiRow(doc, kpis, marginX, y, contentW) + 8
      }
    } catch (e) {
      // si falla KPI, no frena el PDF
      console.warn('KPI draw skipped:', e)
    }

    // ----- CHART GRID LAYOUT -----
    const GAP = 8
    const COLS = 2
    const colW = (contentW - GAP) / 2

    let col = 0
    let x = marginX
    let rowH = 0

    const newPage = () => {
      doc.addPage()
      y = addHeader(false)
      col = 0
      x = marginX
      rowH = 0
    }

    const flushRow = () => {
      if (col !== 0) {
        y += rowH
        col = 0
        x = marginX
        rowH = 0
      }
    }

    for (const ch of charts || []) {
      if (!ch?.image) continue

      // Heurística: si la imagen es muy “ancha”, mejor full width.
      const ratio = getRatio(ch.image)
      const span = ch.span ?? (ratio < 0.55 ? 2 : 1) // 2 = ancho completo, 1 = media columna

      // Si viene un full width y estamos a media fila, bajamos a la siguiente fila
      if (span === 2) flushRow()

      const boxW = span === 2 ? contentW : colW
      const title = safe(ch.title, 'Gráfica')
      doc.setFontSize(11)
      const titleLines = doc.splitTextToSize(title, boxW)
      const titleH = titleLines.length * 5

      const maxImgH = 88 // alto máximo por bloque (ajústalo si quieres más grande/pequeño)
      const img = fit(ch.image, boxW, maxImgH)

      const blockH = titleH + 2 + img.h + 10

      // Si no cabe, nueva página (pero respeta la fila actual)
      if (y + blockH > pageH - marginY) {
        if (span === 1 && col === 1) {
          // Si estábamos en la segunda columna, baja a la siguiente fila antes de saltar
          flushRow()
        }
        if (y + blockH > pageH - marginY) newPage()
      }

      // Card border
      doc.setDrawColor(210)
      doc.setLineWidth(0.3)
      doc.roundedRect(x, y, boxW, blockH - 4, 2, 2, 'S')

      // Título
      doc.setFontSize(11)
      doc.text(titleLines, x + 3, y + 6)

      // Imagen centrada dentro del bloque
      const imgX = x + (boxW - img.w) / 2
      const imgY = y + titleH + 6
      doc.addImage(ch.image, 'PNG', imgX, imgY, img.w, img.h, undefined, 'FAST')

      // avanzar layout
      if (span === 2) {
        y += blockH
        col = 0
        x = marginX
        rowH = 0
        continue
      }

      rowH = Math.max(rowH, blockH)
      col++
      if (col >= COLS) {
        y += rowH
        col = 0
        x = marginX
        rowH = 0
      } else {
        x = marginX + colW + GAP
      }
    }

    // si quedó media fila
    flushRow()

    // Footer con páginas
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(140)
      doc.text(`Página ${i} de ${totalPages}`, pageW - marginX, pageH - 8, { align: 'right' })
      doc.setTextColor(0)
    }

    doc.save(ensurePdfName(filename))
  }

  //  Helpers KPI
  static _buildStatusKPIs(logs = []) {
    const counts = new Map()
    for (const l of Array.isArray(logs) ? logs : []) {
      const k = String(l?.status ?? 'N/A').toUpperCase()
      counts.set(k, (counts.get(k) || 0) + 1)
    }

    const total = Array.isArray(logs) ? logs.length : 0

    //  Orden: por cantidad desc
    const rows = Array.from(counts.entries())
      .map(([status, value]) => ({ status, value }))
      .sort((a, b) => b.value + a.value)

    //  KPI 1: Total + KPIs por status
    return [
      { label: 'Total', value: total, tone: 'neutral' },
      ...rows.map((r) => ({
        label: r.status,
        value: r.value,
        tone: this._toneByStatus(r.status),
      })),
    ]
  }

  static _toneByStatus(status) {
    const s = String(status || '').toUpperCase()
    if (['ERROR', 'FAIL', 'FAILED', 'DENY', 'BLOCKED'].includes(s)) return 'bad'
    if (['WARN', 'WARNING', 'HIGH'].includes(s)) return 'warn'
    if (['OK', 'SUCCESS', 'END', 'INFO', 'PASS'].includes(s)) return 'good'
    return 'neutral'
  }

  static _drawKpiRow(doc, kpis, x, y, width) {
    const ORDER = [
      'total',
      'INFO',
      'SUCCESS',
      'END',
      'WARN',
      'START',
      'DETAIL',
      'ERROR',
      'CONECTADO',
      'BLOCKED',
      'FAILURE',
    ]
    const items = []

    // Normaliza y arma lista en orden
    for (const key of ORDER) {
      const val = kpis?.[key] ?? kpis?.[key?.toLowerCase?.()] ?? null
      if (val == null) continue
      if (key !== 'total' && Number(val) <= 0) continue
      items.push({ key, value: val })
    }

    if (!items.length) return y

    const GAP = 6
    const PER_ROW = 4
    const cardW = (width - GAP * (PER_ROW - 1)) / PER_ROW
    const cardH = 16

    const theme = (k) => {
      const K = String(k || '').toUpperCase()
      const map = {
        TOTAL: { fill: [239, 246, 255], border: [147, 197, 253] }, // azul claro
        INFO: { fill: [219, 234, 254], border: [96, 165, 250] }, // azul
        SUCCESS: { fill: [220, 252, 231], border: [74, 222, 128] }, // verde
        END: { fill: [236, 253, 245], border: [52, 211, 153] }, // verde agua
        WARN: { fill: [255, 251, 235], border: [251, 191, 36] }, // amarillo
        START: { fill: [237, 233, 254], border: [167, 139, 250] }, // morado claro
        DETAIL: { fill: [243, 244, 246], border: [156, 163, 175] }, // gris claro
        ERROR: { fill: [254, 226, 226], border: [248, 113, 113] }, // rojo claro
        CONECTADO: { fill: [240, 253, 250], border: [94, 234, 212] }, // turquesa claro
        BLOCKED: { fill: [255, 237, 213], border: [251, 146, 60] }, // naranja claro
        FAILURE: { fill: [254, 226, 226], border: [248, 113, 113] }, // rojo claro
      }
      return map[K] || { fill: [243, 244, 246], border: [156, 163, 175] }
    }

    doc.setTextColor(17) // texto oscuro

    let cx = x
    let cy = y
    let col = 0

    for (const it of items) {
      const t = theme(it.key)

      doc.setFillColor(...t.fill)
      doc.setDrawColor(...t.border)
      doc.setLineWidth(0.6)
      doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'FD')

      // label
      doc.setFontSize(8)
      doc.text(String(it.key).toUpperCase(), cx + 3, cy + 6)

      // value
      doc.setFontSize(12)
      doc.text(String(it.value), cx + 3, cy + 13)

      col++
      if (col >= PER_ROW) {
        col = 0
        cx = x
        cy += cardH + GAP
      } else {
        cx += cardW + GAP
      }
    }

    return cy
  }

  static _drawKpiCard(doc, x, y, w, h, label, value, tone = 'neutral') {
    //  Colores (RGB) suaves
    const palette = {
      good: { fill: [30, 70, 50], border: [90, 180, 140], text: [255, 255, 255] },
      warn: { fill: [70, 55, 30], border: [220, 170, 70], text: [255, 255, 255] },
      bad: { fill: [75, 35, 35], border: [220, 110, 110], text: [255, 255, 255] },
      neutral: { fill: [40, 40, 60], border: [120, 120, 160], text: [255, 255, 255] },
    }

    const c = palette[tone] || palette.neutral

    doc.setFillColor(...c.fill)
    doc.setDrawColor(...c.border)
    doc.setLineWidth(0.6)
    doc.roundedRect(x, y, w, h, 2, 2, 'FD')

    doc.setTextColor(...c.text)
    doc.setFontSize(9)
    doc.text(String(label), x + 3, y + 6)

    doc.setFontSize(14)
    doc.text(String(value), x + 3, y + 13)
    doc.setTextColor(0)
  }

  // static _estimateImageHeightMm(targetWmm, dataURL) {
  //   return 90
  // }
}

export default ExportService
