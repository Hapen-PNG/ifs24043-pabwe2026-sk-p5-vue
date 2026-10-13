import { requestJson } from '../../../helpers/apiHelper.js'

const send = (method, body) => ({ method, body: JSON.stringify(body) })
const cover = (file) => {
  const form = new FormData()
  form.append('cover', file)
  return { method: 'POST', body: form }
}

export const getAucations = (filters = {}) => {
  const qs = new URLSearchParams(Object.entries(filters).map(([k, v]) => [k, Number(v)])).toString()
  const query = qs ? `?${qs}` : ''
  return requestJson(`/aucations${query}`)
}
export const getAucation = (id) => requestJson(`/aucations/${id}`)
export const addAucation = (body) => requestJson('/aucations', send('POST', body))
export const changeAucation = (id, body) => requestJson(`/aucations/${id}`, send('PUT', body))
export const changeCover = (id, file) => requestJson(`/aucations/${id}/cover`, cover(file))
export const deleteAucation = (id) => requestJson(`/aucations/${id}`, { method: 'DELETE' })
export const deleteAucations = () => requestJson('/aucations', { method: 'DELETE' })
export const addBid = (id, body) => requestJson(`/aucations/${id}/bids`, send('POST', body))
export const deleteBid = (id) => requestJson(`/aucations/${id}/bids`, { method: 'DELETE' })
