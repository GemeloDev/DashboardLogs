// Servicio para diagnósticos de códigos de error, sesiones y soporte
import { API_ENDPOINTS } from './apiEndpoints.js'
import { axiosInstance } from './axiosConfig.js'

export class DiagnosticService {

  static async getCaseId(tokenSesion, system) {
    try {
      console.log(`🔍 Consultando sesión del sistema ${system} por id: ${tokenSesion}`)
      console.log(`🌐 URL: ${API_ENDPOINTS.SESSION_ID}`)

      //  Obtener el 'system' para realizar la petición
      const response = await axiosInstance.get(`${API_ENDPOINTS.SESSION_ID}`, {
        params: {
          system,
          caseId: tokenSesion
        }
      })

      console.log('✅ Datos de "caseId" obtenidos:', response.data.data.items)
      console.log('📊 Status:', response.status)

      return response.data
    } catch (error) {
      console.error('❌ Error al obtener detalles de sesión:', error)
      console.error('📋 Session error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      })

      return {
        success: false,
        error: error.message,
        tokenSesion,
        data: null
      }
    }
  }

  // 🛠️ Enviar solicitud de soporte
  static async sendSupportRequest(code, device, user) {
    try {
      console.log(`🛠️ Enviando solicitud de soporte:`, { code, device, user })

      const params = new URLSearchParams()
      if (code) params.append('code', code)
      if (device) params.append('device', device)
      if (user) params.append('user', user)

      // const url = `${API_BASE_URL}/support?${params.toString()}`
      // console.log(`🌐 URL: ${url}`)

      // const response = await axios.get(url, buildApiConfig())
      const response = []


      // La API de soporte también devuelve arrays de información relacionada
      const data = Array.isArray(response.data) ? response.data : [response.data]

      return {
        success: true,
        data: data,
        requestParams: { code, device, user },
        summary: {
          totalRecords: data.length,
          relatedIssues: data.length,
          baseCode: data[0]?.baseCode,
          user: data[0]?.person?.nombreCompleto,
          office: data[0]?.oficina?.nombre
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        requestParams: { code, device, user },
        data: null
      }
    }
  }

  // 🔍 Diagnóstico completo (combina error code + sesión si están disponibles)
  static async getCompleteDiagnostic(params) {
    const results = {}

    try {
      // Si hay código de error, obtener detalles
      if (params.errorCode) {
        results.errorDetails = await this.getErrorCodeDetails(params.errorCode)
      }

      // Si hay baseCode, obtener detalles de sesión (se muestra baseCode pero se usa sessionToken internamente)
      if (params.baseCode) {
        results.sessionDetails = await this.getSessionDetails(params.baseCode)
      }

      // Si hay parámetros de soporte, enviar solicitud (usar baseCode si está disponible)
      if (params.supportCode || params.device || params.user || params.baseCode) {
        results.supportRequest = await this.sendSupportRequest(
          params.supportCode || params.baseCode || params.errorCode,
          params.device,
          params.user
        )
      }

      return results
    } catch (error) {
      return {
        error: error.message,
        params
      }
    }
  }


  // 🎨 Generar datos de ejemplo para testing
  static getSampleErrorData(errorCode) {
    return {
      success: true,
      data: [{
        id: 3631,
        date: "2025-08-19T09:18:36",
        type: "SUCCESS",
        device: "DELL",
        scanDevice: "S32448806",
        process: "PASSPORT",
        message: "Inicio de sesión exitoso para usuario Alan Manuel Arriola Ortega. Autenticación biométrica completada correctamente.",
        errorCode: errorCode,
        sessionToken: "9a2UQJ4XogaK",
        baseCode: errorCode.split('-')[0] || errorCode,
        trackingCode: null,
        person: {
          id: 28,
          curp: "Manuel",
          nombres: "Alan Manuel",
          primerApellido: "Arriola",
          segundoApellido: "Ortega",
          nombreCompleto: "Alan Manuel Arriola Ortega",
          sexo: null,
          nacionalidad: null,
          fechaNacimiento: null,
          direccion: null
        },
        paisId: null,
        estadoId: null,
        municipioId: null,
        oficina: {
          id: 1,
          nombre: "Oficina Aguascalientes",
          direccion: "Centro Administrativo Aguascalientes",
          paisId: null,
          estadoId: null,
          municipioId: null
        }
      }],
      errorCode,
      summary: {
        totalRecords: 1,
        baseCode: errorCode.split('-')[0] || errorCode,
        sessionToken: "9a2UQJ4XogaK",
        user: "Alan Manuel Arriola Ortega",
        office: "Oficina Aguascalientes"
      }
    }
  }

  static getSampleSessionData(baseCode) {
    return {
      success: true,
      data: [
        {
          id: 3806,
          date: "2025-08-19T13:31:02",
          type: "SUCCESS",
          device: "DELL",
          scanDevice: "S32448806",
          process: "SESSION",
          message: `Log de inicio: Sesión iniciada exitosamente. Token: aZOfuHoQKYZ4`,
          errorCode: baseCode,
          sessionToken: "aZOfuHoQKYZ4",
          baseCode: baseCode,
          trackingCode: null,
          person: {
            id: 28,
            curp: "Manuel",
            nombres: "Alan Manuel",
            primerApellido: "Arriola",
            segundoApellido: "Ortega",
            nombreCompleto: "Alan Manuel Arriola Ortega",
            sexo: null,
            nacionalidad: null,
            fechaNacimiento: null,
            direccion: null
          },
          paisId: null,
          estadoId: null,
          municipioId: null,
          oficina: {
            id: 1,
            nombre: "Oficina Aguascalientes",
            direccion: "Centro Administrativo Aguascalientes",
            paisId: null,
            estadoId: null,
            municipioId: null
          }
        },
        {
          id: 3807,
          date: "2025-08-19T13:31:15",
          type: "SUCCESS",
          device: "DELL",
          scanDevice: "S32448806",
          process: "PASSPORT",
          message: "Log de autenticación: Inicio de sesión exitoso para usuario Alan Manuel Arriola Ortega.",
          errorCode: `${baseCode}-SUC001`,
          sessionToken: "aZOfuHoQKYZ4",
          baseCode: baseCode,
          trackingCode: null,
          person: {
            id: 28,
            curp: "Manuel",
            nombres: "Alan Manuel",
            primerApellido: "Arriola",
            segundoApellido: "Ortega",
            nombreCompleto: "Alan Manuel Arriola Ortega",
            sexo: null,
            nacionalidad: null,
            fechaNacimiento: null,
            direccion: null
          },
          paisId: null,
          estadoId: null,
          municipioId: null,
          oficina: {
            id: 1,
            nombre: "Oficina Aguascalientes",
            direccion: "Centro Administrativo Aguascalientes",
            paisId: null,
            estadoId: null,
            municipioId: null
          }
        },
        {
          id: 3808,
          date: "2025-08-19T13:31:45",
          type: "INFO",
          device: "DELL",
          scanDevice: "S32448806",
          process: "DOCUMENT_SCAN",
          message: "Log de acción: Documento escaneado correctamente - Pasaporte mexicano",
          errorCode: null,
          sessionToken: "aZOfuHoQKYZ4",
          baseCode: baseCode,
          trackingCode: "DOC_001",
          person: {
            id: 28,
            curp: "Manuel",
            nombres: "Alan Manuel",
            primerApellido: "Arriola",
            segundoApellido: "Ortega",
            nombreCompleto: "Alan Manuel Arriola Ortega",
            sexo: null,
            nacionalidad: null,
            fechaNacimiento: null,
            direccion: null
          },
          paisId: null,
          estadoId: null,
          municipioId: null,
          oficina: {
            id: 1,
            nombre: "Oficina Aguascalientes",
            direccion: "Centro Administrativo Aguascalientes",
            paisId: null,
            estadoId: null,
            municipioId: null
          }
        },
        {
          id: 3809,
          date: "2025-08-19T13:32:10",
          type: "WARNING",
          device: "DELL",
          scanDevice: "S32448806",
          process: "VALIDATION",
          message: "Log de advertencia: Calidad de imagen baja detectada, reintentando captura",
          errorCode: `${baseCode}-WAR001`,
          sessionToken: "aZOfuHoQKYZ4",
          baseCode: baseCode,
          trackingCode: "IMG_VAL_001",
          person: {
            id: 28,
            curp: "Manuel",
            nombres: "Alan Manuel",
            primerApellido: "Arriola",
            segundoApellido: "Ortega",
            nombreCompleto: "Alan Manuel Arriola Ortega",
            sexo: null,
            nacionalidad: null,
            fechaNacimiento: null,
            direccion: null
          },
          paisId: null,
          estadoId: null,
          municipioId: null,
          oficina: {
            id: 1,
            nombre: "Oficina Aguascalientes",
            direccion: "Centro Administrativo Aguascalientes",
            paisId: null,
            estadoId: null,
            municipioId: null
          }
        },
        {
          id: 3810,
          date: "2025-08-19T13:32:35",
          type: "SUCCESS",
          device: "DELL",
          scanDevice: "S32448806",
          process: "PRINT",
          message: "Log de finalización: Documento impreso exitosamente - Pasaporte completado",
          errorCode: null,
          sessionToken: "aZOfuHoQKYZ4",
          baseCode: baseCode,
          trackingCode: "PRINT_SUCCESS_001",
          person: {
            id: 28,
            curp: "Manuel",
            nombres: "Alan Manuel",
            primerApellido: "Arriola",
            segundoApellido: "Ortega",
            nombreCompleto: "Alan Manuel Arriola Ortega",
            sexo: null,
            nacionalidad: null,
            fechaNacimiento: null,
            direccion: null
          },
          paisId: null,
          estadoId: null,
          municipioId: null,
          oficina: {
            id: 1,
            nombre: "Oficina Aguascalientes",
            direccion: "Centro Administrativo Aguascalientes",
            paisId: null,
            estadoId: null,
            municipioId: null
          }
        }
      ],
      baseCode,
      summary: {
        totalEvents: 5,
        baseCode: baseCode,
        sessionToken: "aZOfuHoQKYZ4",
        user: "Alan Manuel Arriola Ortega",
        office: "Oficina Aguascalientes",
        processes: ["SESSION", "PASSPORT", "DOCUMENT_SCAN", "VALIDATION", "PRINT"],
        errorTypes: ["SUCCESS", "INFO", "WARNING"],
        dateRange: {
          start: "2025-08-19T13:31:02",
          end: "2025-08-19T13:32:35"
        }
      }
    }
  }

  // 📋 Datos de muestra para soporte
  static getSampleSupportData(supportCode) {
    return {
      success: true,
      supportCode,
      issue: "Error de conexión con dispositivo de escaneo",
      status: "En Progreso",
      technician: "Juan Carlos Medina",
      created: "2025-08-21T10:30:00",
      priority: "Alta",
      category: "Hardware",
      description: "El usuario reporta problemas de conectividad con el escáner principal",
      resolution: "Verificando drivers y conectividad física",
      estimatedTime: "2 horas",
      data: [
        {
          id: 1,
          timestamp: "2025-08-21T10:30:00",
          action: "Ticket creado",
          user: "Alan Manuel Arriola Ortega",
          device: "DELL-PC-001",
          status: "Abierto"
        },
        {
          id: 2,
          timestamp: "2025-08-21T10:45:00",
          action: "Técnico asignado",
          technician: "Juan Carlos Medina",
          priority: "Alta"
        }
      ]
    }
  }
}
