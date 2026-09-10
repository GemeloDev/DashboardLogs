/**
 * Diccionario de traducción de códigos de evento técnicos a nombres
 * comprensibles para usuarios no técnicos.
 */
export const eventDictionary = {
  1022: 'Error de Conexión a Base de Datos',
  10317: 'Fallo de Controlador RDP',
  4176: 'Sesión Interrumpida Inesperadamente',
  INICIO_SESION: 'Fricción en Inicio de Sesión',
  CIERRE_SESION: 'Cierre de Sesión',
  LOGIN: 'Inicio de Sesión',
  LOGOUT: 'Cierre de Sesión',
  AUTHENTICATION: 'Autenticación de Usuario',
  AUTHORIZATION: 'Autorización de Acceso',
  API_CALL: 'Llamada a Servicio',
  HTTP_REQUEST: 'Petición HTTP',
  DATABASE_QUERY: 'Consulta a Base de Datos',
  FILE_UPLOAD: 'Carga de Archivo',
  FILE_DOWNLOAD: 'Descarga de Archivo',
  REPORT_GENERATION: 'Generación de Reporte',
  BATCH_PROCESS: 'Proceso por Lotes',
  SCHEDULED_TASK: 'Tarea Programada',
  SERVICE_DEPENDENCY: 'Servicio Auxiliar No Disponible',
  UPDATE_FAILED: 'Error de Actualización del Sistema',
  APP_CRASH_REPORT: 'Cierre Inesperado de Aplicación',
  ERROR: 'Error del Sistema',
  WARNING: 'Advertencia del Sistema',
  INFO: 'Información',
  START: 'Inicio de Proceso',
  COMPLETED: 'Proceso Completado',
  FAILED: 'Proceso Fallido',
  SUCCESS: 'Operación Exitosa',
  TIMEOUT: 'Tiempo de Espera Agotado',
  VALIDATION_ERROR: 'Error de Validación',
  PERMISSION_DENIED: 'Permiso Denegado',
  RESOURCE_NOT_FOUND: 'Recurso No Encontrado',
}

/**
 * Devuelve el título legible para un código de evento.
 * @param {string|number} code
 * @returns {string}
 */
export function getEventTitle(code) {
  const key = String(code || '')
  return eventDictionary[key] || key
}

export default eventDictionary
