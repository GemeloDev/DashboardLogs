/**
 * Servicio de aceptacion de invitaciones.
 */

import axios from 'axios'
import { axiosInstance } from './axiosConfig'
import { AUTH } from './endpoints'

export const acceptInvite = async (payload) => {
  try {
    const { data } = await axios.post(AUTH.ACCEPT_INVITE, payload)
    return data
  } catch (error) {
    console.error('Error al aceptar invitacion:', error.response?.data || error)
    throw error
  }
}

export const changePassword = async (payload) => {
  try {
    const response = await axiosInstance.post(AUTH.RESET_PASSWORD, payload)
    return response.data
  } catch (error) {
    console.error('Error al resetear contrasena:', error.message)
    return error
  }
}
