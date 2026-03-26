import { axiosInstance } from './axiosConfig'
import { EVA } from './endpoints'

export class CatalogService {

  // --- 1. MÉTODO PRINCIPAL DE CARGA (Una sola consulta) ---
  /**
   * Realiza la petición al catálogo de sistemas una sola vez
   * y distribuye la data para generar todos los catálogos derivados.
   */
  static async fetchCatalogs() {
    try {
      const response = await axiosInstance.get(EVA.CATALOGS_SYSTEMS)

      const items = response.data?.data || []

      console.log(`ℹ️ Catálogo cargado: ${items.length} sistemas.`)

      return {
        sistemas: this._extractSistemas(items),
        sistemasSimple: this._extractNombresSimples(items),
      }

    } catch (error) {
      console.error('❌ Error crítico cargando catálogos:', error.message)
      return {
        sistemas: [],
        sistemasSimple: [],
      }
    }
  }

  // --- 2. MÉTODOS EXTRACTORES (Lógica pura, sin llamadas API) ---

  /**
   * Extrae sistemas en formato { value, label } para usar en selects/filtros.
   * Fuente: campo "name" de cada elemento del array data[].
   */
  static _extractSistemas(items) {
    return items
      .map(item => item.name)
      .filter(Boolean)
      .map(name => ({
        value: name,
        label: name,
      }))
  }

  /**
   * Extrae los nombres de sistemas como array de strings planos.
   * Útil cuando solo se necesita la lista de nombres sin envoltura value/label.
   */
  static _extractNombresSimples(items) {
    return items.map(item => item.name).filter(Boolean)
  }
}
