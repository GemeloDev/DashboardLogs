export const SESSION_KEY = 'dashboardLogsSession'

const safeParse = (raw) => {
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const readSession = () => {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem(SESSION_KEY)) || safeParse(sessionStorage.getItem(SESSION_KEY))
}

export const writeSession = (sessionData, persistent = true) => {
  const storage = persistent ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(sessionData))
}

export const clearStoredSession = () => {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export const getStoredAccessToken = () => readSession()?.token?.accessToken || null

export const getStoredRefreshToken = () => readSession()?.token?.refreshToken || null

export const getStoredUser = () => readSession()?.user || null

export const buildSessionData = ({ user, accessToken, refreshToken, persistent = true }) => ({
  user,
  token: {
    accessToken,
    refreshToken,
  },
  isAuthenticated: true,
  sessionType: persistent ? 'persistent' : 'temporary',
  timestamp: Date.now(),
})

export const updateStoredTokens = (newAccessToken, newRefreshToken) => {
  const sessionData = readSession()
  if (!sessionData) return null

  sessionData.token = {
    ...(sessionData.token || {}),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken || sessionData.token?.refreshToken || null,
  }

  writeSession(sessionData, sessionData.sessionType !== 'temporary')
  return sessionData
}
