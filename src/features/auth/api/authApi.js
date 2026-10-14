import { getApiBaseUrl, normalizeResponse, requestJson } from '../../../helpers/apiHelper.js'

const post = async (path, body) => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return normalizeResponse(await response.json())
}

export const login = ({ email, password }) => post('/auth/login', { email, password })
export const register = ({ name, email, password }) => post('/auth/register', { name, email, password })
export const logout = () => requestJson('/auth/logout', { method: 'POST' })
