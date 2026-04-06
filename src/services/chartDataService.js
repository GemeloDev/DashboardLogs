import { axiosInstance } from './axiosConfig'
import { LOGS } from './endpoints'

// Servicio para gráficas mejoradas según especificaciones técnicas
export class ChartDataService {
  static toYMD(date) {
    const d = new Date(date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  static buildFilterParams(filtros = {}, additionalParams = {}) {
    const params = new URLSearchParams(additionalParams)

    // Defaults: últimos 30 días (evita quedarte “atorado” en 2025)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    const defaultStart = this.toYMD(start)
    const defaultEnd = this.toYMD(end)

    const r = filtros?.rangoFechas || {}
    const from = r.from || ''
    const to = r.to || ''

    const finalFrom = from || to || defaultStart
    const finalTo = to || from || defaultEnd

    params.set('fromDate', finalFrom)
    params.set('toDate', finalTo)

    return params
  }

  static async getAll(filtros = {}, additionalParams = {}) {
    const params = this.buildFilterParams(filtros, additionalParams)

    const { data } = await axiosInstance.get(`${LOGS.EVENTS}`, { params })
    return data // <-- devuelve el body completo { ok, data:{items...} }
  }

  /**
   * Consulta paginada de eventos con filtros server-side.
   *
   * @param {Object} opts
   * @param {string}  opts.system    - Sistema (requerido)
   * @param {number}  opts.page      - Página 0-based (default 0)
   * @param {number}  opts.size      - Registros por página (default 500)
   * @param {string}  opts.fromDate  - Fecha inicio YYYY-MM-DD
   * @param {string}  opts.toDate    - Fecha fin    YYYY-MM-DD
   * @param {string}  opts.sortDir   - ASC | DESC
   * @param {string}  opts.eventType - Filtro por tipo de evento
   * @param {string}  opts.status    - Filtro por status
   * @param {string}  opts.severity  - Filtro por severidad
   * @param {string}  opts.outcome   - Filtro por outcome
   */
  static async getLogsEvents({
    system,
    page = 0,
    size = 500,
    fromDate,
    toDate,
    sortDir,
    eventType,
    status,
    severity,
    outcome,
  } = {}) {
    // Construir solo los params con valor real (evita enviar undefined/null/'')
    const raw = { system, page, size, fromDate, toDate, sortDir, eventType, status, severity, outcome }
    const params = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    )

    const { data } = await axiosInstance.get(LOGS.EVENTS, { params })

    if (!data.ok) {
      throw new Error(data?.message || 'Error al obtener los eventos del sistema')
    }

    // { ok: true, data: { items: [...], totalItems, totalPages, currentPage } }
    return data.data
  }
}
