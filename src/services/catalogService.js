import axios from 'axios'
import { endpoints } from './endpoints'

// Servicio para cargar catálogos - REFACTORIZADO
export class CatalogService {
  static async cargarOficinas() {
    try {
      const response = await axios.get(endpoints.catalogOficinas)
      return response.data.map(oficina => ({
        value: oficina.id,
        label: oficina.nombre
      }))
    } catch (error) {
      console.error('Error cargando oficinas:', error)
      return [
        { value: 1, label: 'Oficina Central' },
        { value: 2, label: 'Oficina Norte' },
        { value: 3, label: 'Oficina Sur' },
      ]
    }
  }

  static async cargarDispositivos() {
    try {
      const response = await axios.get(endpoints.catalogDevices)
      return response.data.map(device => ({
        value: device,
        label: device
      }))
    } catch (error) {
      console.error('Error cargando dispositivos:', error)
      return [
        { value: 'PC-01', label: 'PC Oficina 01' },
        { value: 'PC-02', label: 'PC Oficina 02' },
        { value: 'TABLET-01', label: 'Tablet Móvil 01' },
      ]
    }
  }

  static async cargarEscaneres() {
    try {
      const response = await axios.get(endpoints.catalogScanDevices)
      return response.data.map(scanner => ({
        value: scanner,
        label: scanner
      }))
    } catch (error) {
      console.error('Error cargando escáneres:', error)
      return [
        { value: 'Elyctis123', label: 'Escáner Elyctis 123' },
        { value: 'Scanner456', label: 'Escáner Principal 456' },
        { value: 'Mobile789', label: 'Escáner Móvil 789' },
      ]
    }
  }

  static async cargarPersonas() {
    try {
      const response = await axios.get(endpoints.catalogPersons)
      return response.data.map(persona => {
        // Construir nombre completo manejando apellidos vacíos
        const nombreCompleto = [
          persona.nombres,
          persona.primerApellido,
          persona.segundoApellido
        ].filter(Boolean).join(' ')

        return {
          value: persona.id,
          label: `${nombreCompleto} (${persona.curp})`
        }
      })
    } catch (error) {
      console.error('Error cargando personas:', error)
      return [
        { value: 123, label: 'Juan Pérez (AAAA000000HDFRRR09)' },
        { value: 456, label: 'María García (BBBB111111MDFRRR08)' },
        { value: 789, label: 'Carlos López (CCCC222222HDFRRR07)' },
      ]
    }
  }

  // Opciones estáticas
  static getTiposProceso() {
    return [
      { value: 'QR', label: 'QR' },
      { value: 'MRZ', label: 'MRZ' },
      { value: 'LOGIN', label: 'LOGIN' },
      { value: 'REGISTER', label: 'REGISTER' },
      { value: 'EXPORT', label: 'EXPORT' }
    ]
  }

  static getTiposLog() {
    return [
      { value: 'ERROR', label: 'ERROR' },
      { value: 'SUCCESS', label: 'SUCCESS' },
      { value: 'INFO', label: 'INFO' },
      { value: 'EXPORT', label: 'EXPORT' }
    ]
  }

  static getTiposExportacion() {
    return [
      { value: 'QR', label: 'QR' },
      { value: 'MRZ', label: 'MRZ' },
      { value: 'INE', label: 'INE' },
      { value: 'PASSPORT', label: 'PASSPORT' }
    ]
  }

  static getTiposDatos() {
    return [
      { value: 'Histórico', label: 'Histórico' },
      { value: 'Últimos escaneados', label: 'Últimos escaneados' }
    ]
  }

  static getFormatos() {
    return [
      { value: 'JSON', label: 'JSON' },
      { value: 'Excel', label: 'Excel' },
      { value: 'TXT', label: 'TXT' }
    ]
  }

  static async cargarCalendario() {
    try {
      const response = await axios.get(endpoints.logsCalendar)
      return response.data
    } catch (error) {
      console.error('Error cargando calendario:', error)
      return {
        "2024-06": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "2024-07": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        "2024-08": [1, 2, 3, 4, 5, 6]
      }
    }
  }

  // Método para cargar todos los catálogos de una vez
  static async cargarTodos() {
    try {
      const [oficinas, dispositivos, escaneres, personas] = await Promise.all([
        this.cargarOficinas(),
        this.cargarDispositivos(),
        this.cargarEscaneres(),
        this.cargarPersonas(),
      ])

      return {
        oficinas,
        dispositivos,
        escaneres,
        personas,
      }
    } catch (error) {
      console.error('Error cargando catálogos:', error)
      throw error
    }
  }
}
