/**
 * Configuración Central del Servidor
 * Punto único de configuración para todas las URLs del backend
 */

import { API_BASE_URL } from "src/services/apiConfig"

export const SERVER_CONFIG = {
    BASE_URL: API_BASE_URL || 'https://api-logs.grupo-santoro.com.mx',
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
