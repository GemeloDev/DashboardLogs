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

    // Defaults: días transcurridos en el año actual (desde 01-01-2026 hasta hoy)
    const end = new Date()
    const start = new Date(end.getFullYear(), 0, 1) // 01-01 del año actual

    const defaultStart = this.toYMD(start)
    const defaultEnd = this.toYMD(end)

    const r = filtros?.rangoFechas || {}
    const from = r.from || ''
    const to = r.to || ''

    const finalFrom = from || to || defaultStart
    const finalTo = to || from || defaultEnd

    params.set('from', finalFrom)
    params.set('to', finalTo)

    return params
  }

  static async getAll(filtros = {}, additionalParams = {}) {
    const params = this.buildFilterParams(filtros, {
      page: 0,
      size: 50,
      ...additionalParams,
    })
    params.set('page', String(Math.max(0, Number(params.get('page')) || 0)))
    params.set('size', String(Math.min(100, Math.max(1, Number(params.get('size')) || 50))))

    const { data } = await axiosInstance.get(`${LOGS.EVENTS}`, { params })
    return data // <-- devuelve el body completo { ok, data:{items...} }
  }

  /**
   * Consulta paginada de eventos con filtros server-side.
   *
   * @param {Object} opts
   * @param {string}  opts.system    - Sistema (requerido)
   * @param {number}  opts.page      - Página 0-based (default 0)
   * @param {number}  opts.size      - Registros por página (default 50, máximo 100)
   * @param {string}  opts.from      - Fecha de inicio en formato ISO
   * @param {string}  opts.to        - Fecha de fin en formato ISO
   * @param {string}  opts.sortDir   - ASC | DESC
   * @param {string}  opts.eventType - Filtro por tipo de evento
   * @param {string}  opts.status    - Filtro por status
   * @param {string}  opts.severity  - Filtro por severidad
   * @param {string}  opts.outcome   - Filtro por outcome
   * @param {string}  opts.search    - Búsqueda flexible por actor/username/device
   * @param {string}  opts.deviceId  - Identificador exacto del dispositivo
   */
  static async getLogsEvents({
    system,
    page = 0,
    size = 50,
    from,
    to,
    fromDate,
    toDate,
    sortDir,
    eventType,
    status,
    severity,
    outcome,
    search,
    deviceId,
    sortBy,
    signal,
  } = {}) {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Los aliases conservan compatibilidad con consumidores existentes, pero
    // el backend recibe exclusivamente las claves `from` y `to`.
    const safeFrom = from || fromDate || todayStart.toISOString()
    const safeTo = to || toDate || now.toISOString()

    // Construir solo los params con valor real (evita enviar undefined/null/'')
    const raw = {
      system,
      page: Math.max(0, Number(page) || 0),
      size: Math.min(100, Math.max(1, Number(size) || 50)),
      from: safeFrom,
      to: safeTo,
      sortDir,
      eventType,
      status,
      severity,
      outcome,
      search,
      deviceId,
      sortBy,
    }
    const params = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    )

    const { data } = await axiosInstance.get(LOGS.EVENTS, { params, signal })

    if (!data.ok) {
      throw new Error(data?.message || 'Error al obtener los eventos del sistema')
    }

    // { ok: true, data: { items: [...], totalItems, totalPages, currentPage } }
    return data.data
  }
}
