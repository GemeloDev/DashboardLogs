/**
 * Servicio de Invitaciones
 * Gestión de invitaciones de usuarios
 */

import { axiosInstance } from './axiosConfig'
import { ADMIN } from './endpoints'

/**
 * Envía una invitación a un nuevo usuario
 * @param {Object} inviteData - Datos de la invitación
 * @param {string} inviteData.email - Email del invitado
 * @param {Array<string>} inviteData.roles - Roles asignados
 * @param {number} inviteData.ttlHours - Horas hasta expiración
 * @param {Object} inviteData.logFilters - Valores por los que se filtraran los logs
 * @returns {Promise<Object>}
 */
export const sendInvitation = async (inviteData) => {
    try {
        const response = await axiosInstance.post(
            `${ADMIN.INVITES}`,
            inviteData
        )

        return response.data
    } catch (error) {
        console.error('❌ Error al enviar invitación:', error)
        throw error
    }
}

/**
 * Obtiene el link de invitación generado
 * @param {string} inviteToken - Token de la invitación
 * @returns {string} URL completa de invitación
 */
export const getInvitationLink = (inviteToken) => {
    // Construir URL de invitación
    const baseUrl = window.location.origin
    return `${baseUrl}/#/accept-invitation?token=${inviteToken}`
}

/**
 * Valida los datos de una invitación antes de enviar
 * @param {Object} inviteData
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateInvitationData = (inviteData) => {
    const errors = []

    if (!inviteData.email || !inviteData.email.includes('@')) {
        errors.push('Email inválido')
    }

    if (!inviteData.roles || !Array.isArray(inviteData.roles) || inviteData.roles.length === 0) {
        errors.push('Debe seleccionar al menos un rol')
    }

    if (!inviteData.ttlHours || inviteData.ttlHours < 1) {
        errors.push('Las horas de expiración deben ser al menos 1')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

export default {
    sendInvitation,
    getInvitationLink,
    validateInvitationData
}
