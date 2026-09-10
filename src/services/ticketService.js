import axios from 'axios'
import { getStoredAccessToken } from './sessionStorage'

export const TICKETS_PROXY_ENDPOINT = '/api/analytics/cases/escalate-ticket'

function resolveSessionToken(storeToken = '') {
  if (typeof window === 'undefined') return storeToken || getStoredAccessToken() || ''
  return (
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    storeToken ||
    getStoredAccessToken() ||
    ''
  )
}

function formatAuthorization(token) {
  const value = String(token || '').trim()
  if (!value) return ''
  return /^Bearer\s/i.test(value) ? value : `Bearer ${value}`
}

export const TicketService = {
  create(formData, storeToken = '') {
    const authorization = formatAuthorization(resolveSessionToken(storeToken))
    return axios.post(TICKETS_PROXY_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: authorization,
      },
    })
  },
}

export default TicketService
