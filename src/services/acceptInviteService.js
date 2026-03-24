/**
 * Servicio de Aceptación de Invitaciones
 * Maneja la aceptación de invitaciones de usuario
 */

import axios from 'axios'
import { axiosInstance } from './axiosConfig'
import { AUTH } from './endpoints'

export const acceptInvite = async (payload) => {
  try {
    console.log('📤 Enviando petición de aceptación:', {
      url: `${AUTH.BASE_URL}/auth/accept-invite`,
      token: payload.token?.substring(0, 20) + '...',
      name: payload.name,
    })

    const { data } = await axios.post(`${AUTH.BASE_URL}/auth/accept-invite`, payload)

    console.log('✅ Respuesta de aceptación:', data)
    return data
  } catch (error) {
    console.error('❌ Error al aceptar invitación:', error.response?.data || error)
    throw error
  }
}

export const changePassword = async (payload) => {
  try {
    console.log('📤 Cambiando contraseña:', payload)

    const response = await axiosInstance.post(`${AUTH.RESET_PASSWORD}`, payload)
    return response.data
  } catch (error) {
    console.error('❌ Error al resetear contraseña: ', error.message)
    return error
  }
}
