/**
 * Servicio de Usuarios
 * Gestión de usuarios del sistema
 */

import { axiosInstance } from './axiosConfig'
import { SERVER_CONFIG } from '../config/serverConfig'

/**
 * Obtiene la lista de usuarios con paginación
 * @param {number} page - Número de página (0-indexed)
 * @param {number} size - Tamaño de página
 * @param {string} search - Término de búsqueda (opcional)
 * @param {string} role - Filtro por rol (opcional)
 * @returns {Promise<Object>}
 */
export const getUsers = async (page = 0, size = 10, search = '', role = '') => {
    try {
        const params = {
            page,
            size
        }

        if (search) params.search = search
        if (role) params.role = role

        const response = await axiosInstance.get(`${SERVER_CONFIG.BASE_URL}/api/core/users`, {
            params
        })

        console.log('✅ Usuarios obtenidos:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error)
        throw error
    }
}

/**
 * Obtiene los roles disponibles desde los usuarios
 * @returns {Promise<Array<string>>}
 */
export const getAvailableRoles = async () => {
    try {
        // Obtener todos los usuarios para extraer roles
        const response = await getUsers(0, 100) // Obtener más usuarios para análisis

        // Extraer roles únicos
        const rolesSet = new Set()
        response.data?.forEach(user => {
            if (user.roles && Array.isArray(user.roles)) {
                user.roles.forEach(role => rolesSet.add(role))
            }
        })

        const roles = Array.from(rolesSet)
        console.log('✅ Roles disponibles:', roles)
        return roles
    } catch (error) {
        console.error('❌ Error al obtener roles:', error)
        return []
    }
}

/**
 * Busca usuarios por término
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} page - Página
 * @param {number} size - Tamaño
 * @returns {Promise<Object>}
 */
export const searchUsers = async (searchTerm, page = 0, size = 10) => {
    return await getUsers(page, size, searchTerm)
}

/**
 * Filtra usuarios por rol
 * @param {string} role - Rol a filtrar
 * @param {number} page - Página
 * @param {number} size - Tamaño
 * @returns {Promise<Object>}
 */
export const filterUsersByRole = async (role, page = 0, size = 10) => {
    return await getUsers(page, size, '', role)
}

export default {
    getUsers,
    getAvailableRoles,
    searchUsers,
    filterUsersByRole
}
