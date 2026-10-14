const TOKEN_KEY = 'accessToken'
const DEFAULT_API_BASE_URL = 'https://open-api.delcom.org/api/v1'

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_DELCOM_BASEURL?.trim() || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY)

export function fetchWithAuth(url, options = {}) {
  const token = getAccessToken()
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  if (options.body instanceof FormData) delete headers['Content-Type']
  return fetch(url, { ...options, headers })
}

export const normalizeResponse = (json) => ({ ...json, success: json.status === 'success' })

export const requestJson = async (path, options) =>
  normalizeResponse(await (await fetchWithAuth(`${getApiBaseUrl()}${path}`, options)).json())
