// Configuración centralizada de la URL base
// En desarrollo usamos el proxy configurado en quasar.config.js (/api -> http://187.188.66.56:8024/api)
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://187.188.66.56:8024/api'
  : '/api';

// Configuración global de axios con headers CORS
export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Headers para CORS en producción
    ...(process.env.NODE_ENV === 'production' && {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    })
  }
}
