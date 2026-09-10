import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const COLORS = {
  navy: [30, 41, 59],
  slate: [71, 85, 105],
  muted: [100, 116, 139],
  line: [226, 232, 240],
  light: [248, 250, 252],
  white: [255, 255, 255],
  green: [22, 163, 74],
  red: [220, 38, 38],
}

const SEVERITY_COLORS = {
  info: '#1AC8ED',
  error: '#F5222D',
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export async function getChartImage(chartRef) {
  if (!chartRef) return null

  try {
    if (typeof chartRef.toDataURL === 'function') return chartRef.toDataURL('image/png')
    if (typeof chartRef.getDataURL === 'function') return chartRef.getDataURL({ type: 'png' })
    if (typeof chartRef.getImageURI === 'function') return chartRef.getImageURI()
    if (typeof chartRef.dataURI === 'function') {
      const result = await chartRef.dataURI()
      return result?.imgURI || result
    }
    if (chartRef.chart?.dataURI) {
      const result = await chartRef.chart.dataURI()
      return result?.imgURI || null
    }

    const element = chartRef.$el || chartRef
    if (!(element instanceof Element)) return null
    const canvas = element.matches('canvas') ? element : element.querySelector('canvas')
    if (canvas?.toDataURL) return canvas.toDataURL('image/png')

    const capture = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    return capture.toDataURL('image/png')
  } catch (error) {
    console.warn('[pdfExportService] No fue posible capturar una gráfica:', error)
    return null
  }
}

export async function captureExecutiveCharts({ severityRef, trendRef }) {
  await wait(200)
  return Promise.all([getChartImage(severityRef), getChartImage(trendRef)])
}

function rowCount(row) {
  return Number(row?.count ?? row?.value ?? row?.total ?? row?.events ?? row?.totalEvents ?? 0) || 0
}

function hourFromRow(row) {
  const direct = row?.hour ?? row?.hora
  if (direct !== undefined && direct !== null && direct !== '') {
    const match = String(direct).match(/\d{1,2}/)
    return match ? Number(match[0]) : null
  }

  const rawDate = row?.timestamp ?? row?.eventTime ?? row?.createdAt ?? row?.date
  if (!rawDate) return null
  const date = new Date(rawDate)
  return Number.isNaN(date.getTime()) ? null : date.getHours()
}

function buildTodayTrendRows(seriesData = {}, logs = [], now = new Date()) {
  const currentHour = now.getHours()
  const counts = Array.from({ length: currentHour + 1 }, () => 0)
  const hourlyRows = [
    seriesData?.byHour,
    seriesData?.hourly,
    seriesData?.hourlySeries,
    seriesData?.trendSeriesData,
  ].find(Array.isArray)

  const sourceRows = hourlyRows?.length ? hourlyRows : logs
  sourceRows.forEach((row) => {
    const hour = hourFromRow(row)
    if (hour === null || hour < 0 || hour > currentHour) return
    counts[hour] += hourlyRows?.length ? rowCount(row) : 1
  })

  return counts.map((count, hour) => ({
    label: `${String(hour).padStart(2, '0')}:00`,
    count,
  }))
}

function buildPeriodTrendRows(seriesData = {}) {
  const rows = [seriesData?.byDay, seriesData?.statusOverTime, seriesData?.byWeek, seriesData?.byMonth]
    .find((items) => Array.isArray(items) && items.length) || []
  const totals = new Map()
  rows.forEach((row) => {
    const label = String(row?.date ?? row?.label ?? row?.period ?? '').trim()
    if (label) totals.set(label, (totals.get(label) || 0) + rowCount(row))
  })
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ label, count }))
}

export function createTrendChartImage({ seriesData = {}, logs = [], isToday = false, now = new Date() } = {}) {
  if (typeof document === 'undefined') return null
  const rows = isToday
    ? buildTodayTrendRows(seriesData, logs, now)
    : buildPeriodTrendRows(seriesData)
  if (!rows.length) return null

  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 520
  const context = canvas.getContext('2d')
  if (!context) return null

  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const frame = { left: 72, top: 36, right: 32, bottom: 72 }
  const width = canvas.width - frame.left - frame.right
  const height = canvas.height - frame.top - frame.bottom
  const max = Math.max(...rows.map((row) => row.count), 1)

  context.strokeStyle = '#E2E8F0'
  context.fillStyle = '#64748B'
  context.font = '22px Arial'
  context.textAlign = 'right'
  for (let step = 0; step <= 4; step += 1) {
    const y = frame.top + (height * step) / 4
    context.beginPath()
    context.moveTo(frame.left, y)
    context.lineTo(frame.left + width, y)
    context.stroke()
    context.fillText(String(Math.round(max * (1 - step / 4))), frame.left - 12, y + 7)
  }

  const x = (index) => frame.left + (rows.length === 1 ? width / 2 : (width * index) / (rows.length - 1))
  const y = (value) => frame.top + height - (height * value) / max
  context.strokeStyle = SEVERITY_COLORS.info
  context.lineWidth = 6
  context.lineJoin = 'round'
  context.beginPath()
  rows.forEach((row, index) => index ? context.lineTo(x(index), y(row.count)) : context.moveTo(x(index), y(row.count)))
  context.stroke()
  context.fillStyle = SEVERITY_COLORS.info
  rows.forEach((row, index) => {
    context.beginPath()
    context.arc(x(index), y(row.count), 7, 0, Math.PI * 2)
    context.fill()
  })

  const labelStep = Math.max(1, Math.ceil(rows.length / 8))
  context.fillStyle = '#64748B'
  context.font = '20px Arial'
  context.textAlign = 'center'
  rows.forEach((row, index) => {
    if (index % labelStep === 0 || index === rows.length - 1) {
      context.fillText(row.label, x(index), canvas.height - 28)
    }
  })
  return canvas.toDataURL('image/png')
}

function addHeader(doc, organizationName, generatedAt) {
  doc.setFillColor(...COLORS.navy)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(...COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(String(organizationName || 'ORGANIZACIÓN').toUpperCase(), 12, 9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(generatedAt, 198, 9, { align: 'right' })
  doc.setFontSize(9)
  doc.text('REPORTE EJECUTIVO DE OPERACIÓN', 12, 16)
}

function addKpis(doc, data) {
  const critical = ['CRITICAL', 'WARNING'].includes(data.healthStatus)
  const cards = [
    { label: 'ESTADO GENERAL', value: data.status, accent: critical ? COLORS.red : COLORS.green },
    { label: 'EVENTOS PROCESADOS', value: String(data.totalEvents), accent: COLORS.slate },
    { label: 'TASA DE ERROR', value: data.errorRate, accent: critical ? COLORS.red : COLORS.green },
    { label: 'INCIDENTES ACTIVOS', value: String(data.activeCases), accent: data.activeCases ? COLORS.red : COLORS.green },
  ]

  cards.forEach((card, index) => {
    const x = 12 + index * 47
    doc.setFillColor(242, 244, 247)
    doc.roundedRect(x + 0.7, 29.7, 43, 19, 2, 2, 'F')
    doc.setFillColor(...COLORS.white)
    doc.setDrawColor(...COLORS.line)
    doc.roundedRect(x, 29, 43, 19, 2, 2, 'FD')
    doc.setFillColor(...card.accent)
    doc.roundedRect(x, 29, 2.2, 19, 1, 1, 'F')
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.2)
    doc.text(card.label, x + 5, 35)
    doc.setTextColor(...COLORS.navy)
    doc.setFontSize(card.value.length > 18 ? 7.5 : 11)
    doc.text(card.value, x + 5, 43)
  })
}

function addSeverityLegend(doc, x) {
  const badges = [
    { color: [26, 200, 237], label: 'INFO / ÉXITO', detail: 'Eventos Operativos' },
    { color: [245, 34, 45], label: 'ERROR / ATENCIÓN', detail: 'Incidentes Detectados' },
  ]

  badges.forEach((badge, index) => {
    const badgeY = 101.5 + index * 5
    doc.setFillColor(...badge.color)
    doc.roundedRect(x + 4.7, badgeY - 0.1, 2.65, 2.65, 0.5, 0.5, 'F')
    doc.setTextColor(...COLORS.navy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.text(badge.label, x + 9, badgeY + 2)
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.text(`(${badge.detail})`, x + 39, badgeY + 2)
  })
}

function addChartPanel(doc, { x, title, image, emptyText, severityLegend = false }) {
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.line)
  doc.roundedRect(x, 57, 90, 56, 2, 2, 'FD')
  doc.setTextColor(...COLORS.navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(title, x + 4, 64)
  if (image) {
    try {
      doc.addImage(image, 'PNG', x + 4, 68, 82, severityLegend ? 31 : 40, undefined, 'FAST')
      if (severityLegend) addSeverityLegend(doc, x)
      return
    } catch (error) {
      console.warn('[pdfExportService] Imagen de gráfica inválida:', error)
    }
  }
  doc.setFillColor(...COLORS.light)
  doc.roundedRect(x + 4, 68, 82, 40, 1.5, 1.5, 'F')
  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(emptyText, x + 45, 89, { align: 'center', maxWidth: 72 })
}

function addTechnicalConclusion(doc, { y, data, affectedUsers }) {
  const errorRate = Number(data.errorRateValue || 0)
  const accent = errorRate > 5 ? COLORS.red : [234, 88, 12]
  const recommendation =
    errorRate > 5
      ? 'Se recomienda revisar los servicios de autenticación y logs de error en el servidor principal.'
      : errorRate === 0
        ? 'El sistema opera dentro de los parámetros óptimos sin acciones requeridas.'
        : 'Se recomienda mantener el monitoreo preventivo de los eventos registrados.'
  const synthesis =
    `SÍNTESIS: El sistema ${data.system} registró una tasa de error del ${data.errorRate} ` +
    `afectando a ${affectedUsers} ${affectedUsers === 1 ? 'usuario' : 'usuarios'} en el periodo ` +
    `(${data.dateRangeLabel}). ${recommendation}`

  doc.setFillColor(...COLORS.light)
  doc.setDrawColor(...COLORS.line)
  doc.roundedRect(12, y, 186, 34, 2, 2, 'FD')
  doc.setFillColor(...accent)
  doc.roundedRect(12, y, 2.2, 34, 1, 1, 'F')
  doc.setTextColor(...accent)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('CONCLUSIÓN / RECOMENDACIÓN TÉCNICA', 18, y + 8)
  doc.setTextColor(...COLORS.navy)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.text(doc.splitTextToSize(synthesis, 174), 18, y + 15, { lineHeightFactor: 1.35 })
}

function addTable(doc, { title, y, columns, rows, emptyText }) {
  doc.setTextColor(...COLORS.navy)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(title, 12, y)
  const headerY = y + 3
  const rowHeight = 6
  doc.setFillColor(...COLORS.navy)
  doc.roundedRect(12, headerY, 186, rowHeight, 1, 1, 'F')
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(6.8)
  let x = 12
  columns.forEach((column) => {
    doc.text(column.label, x + 2, headerY + 4.2)
    x += column.width
  })

  const displayRows = rows.length ? rows : [{ __empty: emptyText }]
  displayRows.forEach((row, index) => {
    const rowY = headerY + rowHeight * (index + 1)
    doc.setFillColor(...(index % 2 ? COLORS.light : COLORS.white))
    doc.setDrawColor(...COLORS.line)
    doc.rect(12, rowY, 186, rowHeight, 'FD')
    doc.setTextColor(row.__empty ? COLORS.green[0] : COLORS.navy[0], row.__empty ? COLORS.green[1] : COLORS.navy[1], row.__empty ? COLORS.green[2] : COLORS.navy[2])
    doc.setFont('helvetica', row.__empty ? 'bold' : 'normal')
    doc.setFontSize(6.8)
    if (row.__empty) {
      doc.text(row.__empty, 15, rowY + 4.2)
      return
    }
    let cellX = 12
    columns.forEach((column) => {
      const text = doc.splitTextToSize(String(row[column.key] ?? '-'), column.width - 4)[0] || ''
      doc.text(text, cellX + 2, rowY + 4.2)
      cellX += column.width
    })
  })
  return headerY + rowHeight * (displayRows.length + 1)
}

function addDocumentFurniture(doc) {
  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    doc.setTextColor(226, 232, 240)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setDrawColor(...COLORS.line)
    doc.line(12, 282, 198, 282)
    doc.setTextColor(...COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('Documento Confidencial', 12, 288)
    doc.text(`Página ${page} de ${totalPages}`, 198, 288, { align: 'right' })
  }
}

export function generateExecutivePdf({ data, organizationName, charts = [], frictionRows = [], affectedRows = [] }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const generatedAt = new Date().toLocaleString('es-MX')
  addHeader(doc, organizationName, generatedAt)

  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  const dates = data.fromDate || data.toDate ? `${data.fromDate || 'Inicio'} — ${data.toDate || 'Actualidad'}` : 'Histórico completo'
  doc.text(`Sistema: ${data.system}  |  Periodo: ${data.dateRangeLabel}  |  ${dates}`, 12, 26)
  addKpis(doc, data)
  addChartPanel(doc, { x: 12, title: 'DISTRIBUCIÓN POR SEVERIDAD', image: charts[0], emptyText: 'Sin registros de severidad en el periodo', severityLegend: true })
  addChartPanel(doc, { x: 108, title: 'ESTADOS / TENDENCIA DE EVENTOS', image: charts[1], emptyText: 'Sin registros de tendencia en el periodo' })

  const frictionBottom = addTable(doc, {
    title: 'EVENTOS CON MAYOR FRICCIÓN',
    y: 121,
    columns: [
      { key: 'event', label: 'Evento', width: 94 },
      { key: 'occurrences', label: 'Ocurrencias', width: 30 },
      { key: 'affected', label: 'Afectados', width: 26 },
      { key: 'system', label: 'Sistema', width: 36 },
    ],
    rows: frictionRows.slice(0, 5),
    emptyText: '✓ Sin eventos de fricción en el periodo seleccionado.',
  })
  const affectedBottom = addTable(doc, {
    title: 'USUARIOS AFECTADOS EN EL PERIODO',
    y: frictionBottom + 8,
    columns: [
      { key: 'name', label: 'Nombre', width: 62 },
      { key: 'username', label: 'Usuario', width: 44 },
      { key: 'errors', label: 'Errores', width: 36 },
      { key: 'system', label: 'Sistema', width: 44 },
    ],
    rows: affectedRows.slice(0, 8),
    emptyText: '✓ Sin usuarios afectados en el periodo seleccionado.',
  })
  addTechnicalConclusion(doc, {
    y: Math.min(affectedBottom + 8, 244),
    data,
    affectedUsers: affectedRows.length,
  })

  addDocumentFurniture(doc)
  return doc
}
