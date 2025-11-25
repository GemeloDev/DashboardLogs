/**
 * Configuración de endpoints de API
 * Centraliza todas las URLs de los servicios backend
 */

import axios from "axios"

// Base URL del servidor
const BASE_URL = 'http://187.188.66.56:8040'

export const acceptInvite = async (payload) => {
  const { data } = await axios.post(`${BASE_URL}/api/auth/accept-invite`, payload)
  return data
}
