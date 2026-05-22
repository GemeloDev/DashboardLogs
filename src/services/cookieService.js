/**
 * Servicio de Gestión de Cookies
 * Maneja el almacenamiento seguro de JWT en cookies
 */

import { jwtDecode } from 'jwt-decode'

const JWT_COOKIE_NAME = 'jwt_token'

/**
 * Almacena el JWT en una cookie
 * @param {string} token - Token JWT a almacenar
 * @param {number} expirationDays - Días hasta que expire (default: 7)
 */
export const storeJWTInCookie = (token, expirationDays = 7) => {
    try {
        const date = new Date()
        date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000))
        const expires = `expires=${date.toUTCString()}`

        // SameSite=Strict para mayor seguridad
        document.cookie = `${JWT_COOKIE_NAME}=${token}; ${expires}; path=/; SameSite=Strict`

        return true
    } catch (error) {
        console.error('❌ Error al almacenar JWT en cookie:', error)
        return false
    }
}

/**
 * Obtiene el JWT de la cookie
 * @returns {string|null} Token JWT o null si no existe
 */
export const getJWTFromCookie = () => {
    try {
        const name = JWT_COOKIE_NAME + '='
        const decodedCookie = decodeURIComponent(document.cookie)
        const cookieArray = decodedCookie.split(';')

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim()
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length)
            }
        }
        return null
    } catch (error) {
        console.error('❌ Error al obtener JWT de cookie:', error)
        return null
    }
}

/**
 * Obtiene los datos del JWT
 * @returns { dataUser|null } Obtiene los datos del usuario a partir del JWT
 */
export const getJWTData = (token) => {
  if (!token ) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error al decodificar el JWT:', error)
    return null;
  }
}

/**
 * Elimina el JWT de la cookie
 */
export const deleteJWTFromCookie = () => {
    try {
        document.cookie = `${JWT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
        return true
    } catch (error) {
        console.error('❌ Error al eliminar JWT de cookie:', error)
        return false
    }
}

/**
 * Verifica si existe un JWT en la cookie
 * @returns {boolean}
 */
export const hasJWTInCookie = () => {
    return getJWTFromCookie() !== null
}
