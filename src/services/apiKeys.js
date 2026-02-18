import { useQuasar } from 'quasar'
import { axiosInstance } from './axiosConfig'
import { API_BASE_URL } from './apiConfig'

const $q = useQuasar()
const BASE_URL = `${API_BASE_URL}/catalogs/api-keys`

export class ApiKeyService {
  /**
   * Obtiene el listado paginado de API Keys
   * GET /api/catalogs/api-keys?page=0&size=25
   * @param {Object} params - { page: 0, size: 25 }
   */
  static async getAll(params = { page: 0, size: 25 }) {
    try {
      const response = await axiosInstance.get(BASE_URL, { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener API Keys:', error)
      throw error
    }
  }

  /**
   * Crea una nueva API Key y descarga el archivo .txt con las credenciales
   * POST /api/catalogs/api-keys
   * @param {Object} payload - { name, systemId, environmentId, scopes, ttlDays, rotateDays }
   */
  static async create(payload, extension = 'txt') {
    try {
      const response = await axiosInstance.post(`${BASE_URL}?export=${extension}`, payload, {
        responseType: 'arraybuffer', // Importante para recibir el archivo
        headers: {
          'Accept': '*/*'
        }
      })

      //  Construcción del nombre del archivo con la extensión seleccionada
      const safeName = (payload.name || 'api_key').replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${safeName}-credentials.${extension}`

      // Lógica para descargar el archivo
      this.descargarArchivo(response, filename)

      return { success: true, message: 'API Key creada y descargada.' }
    } catch (error) {
      console.error('Error al crear API Key:', error)
      throw error
    }
  }

  /**
   * Renueva una API Key existente
   * POST /api/catalogs/api-keys/{id}/renew
   * @param {Object} payload - { id:#######, ttlDays: 35, rotateDays: 30 }
   */
  static async renew(id, payload) {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${id}/renew`, payload)
      return response.data
    } catch (error) {
      console.error('Error al renovar API Key:', error)
      throw error
    }
  }

  /**
   * Elimina/Revoca una API Key
   * DELETE /api/catalogs/api-keys/{id}
   * @param {String} id - ID de la API Key
   */
  static async delete(id) {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error al eliminar API Key:', error)
      $q.notify({
        type: 'negative',
        message: '❌ Error al eliminar la API Key.',
      })
      throw error
    }
  }

  // --- Helper Privado para descarga ---
  static descargarArchivo(response, defaultFilename) {
    // Intentar obtener nombre del header content-disposition si existe
    let filename = defaultFilename
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '')
      }
    }

    // Crear Blob y Link
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Limpieza
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const RateLimitService = {
  get() {
    return axiosInstance.get(`${API_BASE_URL}/admin/rate-limit`)
  },
  update(payload) {
    return axiosInstance.put(`${API_BASE_URL}/admin/rate-limit`, payload)
  },
  clear() {
    return axiosInstance.delete(`${API_BASE_URL}/admin/rate-limit`)
  }
}
