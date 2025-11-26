/**
 * Configuración Central del Servidor
 * Punto único de configuración para todas las URLs del backend
 */

export const SERVER_CONFIG = {
    BASE_URL: 'http://187.188.66.56:8040',
    API_VERSION: 'v1',
    TIMEOUT: 30000, // 30 segundos
}

// Helper functions para construir URLs
export const getApiUrl = (endpoint) => {
    return `${SERVER_CONFIG.BASE_URL}${endpoint}`
}

export const getAuthUrl = (endpoint) => {
    return `${SERVER_CONFIG.BASE_URL}/api/auth${endpoint}`
}

export const getCoreUrl = (endpoint) => {
    return `${SERVER_CONFIG.BASE_URL}/api/core${endpoint}`
}

export const getAdminUrl = (endpoint) => {
    return `${SERVER_CONFIG.BASE_URL}/api/admin${endpoint}`
}

export default SERVER_CONFIG
