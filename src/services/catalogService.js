import { endpoints } from './endpoints'
import { axiosInstance } from './axiosConfig'

export class CatalogService {

  // --- 1. MÉTODO PRINCIPAL DE CARGA (Una sola consulta) ---

  /**
   * Realiza la petición a la API una sola vez y distribuye la data
   * para generar todos los catálogos derivados.
   */
  static async fetchCatalogs() {
    try {
      // Ejecutamos las peticiones principales en paralelo
      // 1. Logs (de donde sacaremos oficinas, estatus, dispositivos, etc.)
      // 2. Personas (endpoint separado según tu código original)
      const [logsResponse, personsResponse] = await Promise.all([
        axiosInstance.get(endpoints.catalogEvents),
        axiosInstance.get(endpoints.catalogPersons).catch(() => ({ data: { data: { data: [] } } })) // Fallback si falla personas
      ])

      const items = logsResponse.data.data.items || []
      const personasRaw = personsResponse.data.data.data || []

      console.log(`ℹ️ Datos cargados: ${items.length} eventos y ${personasRaw.length} personas.`)

      // Retornamos un objeto consolidado procesando la data en memoria
      return {
        oficinas: this._extractOficinas(items),
        dispositivos: this._extractCampoSimple(items, 'channel'),
        estatus: this._extractCampoSimple(items, 'status'),
        tiposProcesos: this._extractCampoSimple(items, 'operationType'),
        personas: this._formatPersonas(personasRaw)
      }

    } catch (error) {
      console.error('❌ Error crítico cargando catálogos:', error.message)
      return {
        oficinas: [],
        dispositivos: [],
        estatus: [],
        tiposProcesos: [],
        personas: []
      }
    }
  }

  // --- 2. MÉTODOS EXTRACTORES (Lógica pura, sin llamadas API) ---

  /**
   * Extrae oficinas únicas basándose en el ID para evitar duplicados.
   */
  static _extractOficinas(items) {
    const oficinasMap = new Map()

    items.forEach(item => {
      if (item.office && item.office.officeId) {
        oficinasMap.set(item.office.officeId, {
          value: item.office.officeId,
          label: item.office.officeName || 'Sin Nombre'
        })
      }
    })

    return Array.from(oficinasMap.values())
  }

  /**
   * Método genérico para extraer valores únicos de campos simples (strings).
   * Sirve para: channel, status, operationType, etc.
   */
  static _extractCampoSimple(items, fieldName) {
    // 1. Mapear al valor
    // 2. Crear Set para únicos
    // 3. Filtrar nulos/vacíos
    const uniqueValues = [...new Set(items.map(item => item[fieldName]))].filter(Boolean)

    return uniqueValues.map(val => ({
      value: val,
      label: val
    }))
  }

  /**
   * Formatea la respuesta del endpoint de personas.
   */
  static _formatPersonas(personasData) {
    return personasData.map(persona => {
      const nombreCompleto = [persona.name].filter(Boolean).join(' ')
      return {
        value: persona.id,
        label: persona.email ? `${nombreCompleto} (${persona.email})` : nombreCompleto
      }
    })
  }
}
