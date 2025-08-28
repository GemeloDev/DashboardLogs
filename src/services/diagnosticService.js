// Servicio para diagnósticos de códigos de error, sesiones y soporte
import axios from 'axios'

const API_BASE_URL = '/api'

export class DiagnosticService {

    // 🔍 Obtener detalles de código de error
    static async getErrorCodeDetails(errorCode) {
        try {
            console.log(`🔍 Consultando código de error: ${errorCode}`)

            const response = await axios.get(`${API_BASE_URL}/error-codes/${errorCode}`)

            console.log('✅ Detalles del código de error obtenidos:', response.data)

            // La API devuelve un array de objetos con información detallada
            const data = Array.isArray(response.data) ? response.data : [response.data]

            return {
                success: true,
                data: data,
                errorCode,
                summary: {
                    totalRecords: data.length,
                    firstRecord: data[0],
                    baseCode: data[0]?.baseCode,
                    sessionToken: data[0]?.sessionToken,
                    user: data[0]?.person?.nombreCompleto,
                    office: data[0]?.oficina?.nombre
                }
            }
        } catch (error) {
            console.error('❌ Error al obtener detalles del código:', error)

            // Si es un error de red o servidor, usar datos de muestra
            if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
                console.log('🔄 Usando datos de muestra por error de conectividad')
                return this.getSampleErrorData(errorCode)
            }

            return {
                success: false,
                error: error.message,
                errorCode,
                data: null
            }
        }
    }

    // 🔍 Obtener detalles de sesión (usando baseCode en lugar de sessionToken)
    static async getSessionDetails(baseCode) {
        try {
            console.log(`🔍 Consultando sesión por baseCode: ${baseCode}`)

            const response = await axios.get(`${API_BASE_URL}/sessions/${baseCode}`)

            console.log('✅ Detalles de sesión obtenidos:', response.data)

            // La API devuelve un array de objetos relacionados con la sesión
            const data = Array.isArray(response.data) ? response.data : [response.data]

            return {
                success: true,
                data: data,
                baseCode,
                summary: {
                    totalEvents: data.length,
                    baseCode: data[0]?.baseCode,
                    sessionToken: data[0]?.sessionToken,
                    user: data[0]?.person?.nombreCompleto,
                    office: data[0]?.oficina?.nombre,
                    processes: [...new Set(data.map(item => item.process))],
                    errorTypes: [...new Set(data.map(item => item.type))],
                    dateRange: {
                        start: data[0]?.date,
                        end: data[data.length - 1]?.date
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al obtener detalles de sesión:', error)

            // Si es un error de red o servidor, usar datos de muestra
            if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
                console.log('🔄 Usando datos de muestra por error de conectividad')
                return this.getSampleSessionData(baseCode)
            }

            return {
                success: false,
                error: error.message,
                baseCode,
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

            const response = await axios.get(`${API_BASE_URL}/support?${params.toString()}`)

            console.log('✅ Solicitud de soporte enviada:', response.data)

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
            console.error('❌ Error al enviar solicitud de soporte:', error)
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
            console.error('❌ Error en diagnóstico completo:', error)
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
