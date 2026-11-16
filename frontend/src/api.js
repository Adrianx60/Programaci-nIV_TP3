const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getErrorMessage(payload, status) {
  if (Array.isArray(payload?.detalles) && payload.detalles.length > 0) {
    return payload.detalles
      .map(({ campo, mensaje }) => campo ? `${campo}: ${mensaje}` : mensaje)
      .join(' · ')
  }

  return payload?.message || payload?.error || `La solicitud falló (HTTP ${status}).`
}

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá que el backend esté iniciado.')
  }

  let payload = null
  if (response.status !== 204) {
    const text = await response.text()
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { message: text }
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status)
  }

  return payload
}

function unwrapList(payload, resource) {
  const items = Array.isArray(payload) ? payload : payload?.data
  if (!Array.isArray(items)) {
    throw new ApiError(`La API devolvió un formato inválido al consultar ${resource}.`)
  }
  return items
}

export const api = {
  login: (values) => request('/auth/login', { method: 'POST', body: values }),
  register: (values) => request('/auth/register', { method: 'POST', body: values }),
  list: async (resource, token) => unwrapList(
    await request(`/${resource}`, { token }),
    resource,
  ),
  create: (resource, token, values) => request(`/${resource}`, {
    method: 'POST',
    token,
    body: values,
  }),
  update: (resource, token, id, values) => request(`/${resource}/${id}`, {
    method: 'PUT',
    token,
    body: values,
  }),
  remove: (resource, token, id) => request(`/${resource}/${id}`, {
    method: 'DELETE',
    token,
  }),
}
