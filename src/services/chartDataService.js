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

  static async getLogsEvents({
    system,
    page = 1,
    size = 500
  } = {}) {
    const { data } = await axiosInstance.get(`${LOGS.EVENTS_RAW}`, {
      params: { system, page, size }
    })

    if (!data.ok) {
      throw new Error(data?.message || 'Error al obtener los eventos del sistema')
    }

    // Retorna el objeto de paginación + items
    // { ok: true, data: { items: [...], totalItems, totalPages, currentPage } }
    return data.data
  }
}
