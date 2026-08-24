const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000/api/v1'

type ApiErrorResponse = {
  message?: string
  code?: string
  details?: unknown
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const accessToken = localStorage.getItem('kai_access_token')
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  })

  if (response.status === 401) {
    localStorage.removeItem('kai_access_token')
    localStorage.removeItem('kai_user')
  }

  if (!response.ok) {
    let errorBody: ApiErrorResponse = {}

    try {
      errorBody = (await response.json()) as ApiErrorResponse
    } catch {
      errorBody = {}
    }

    throw new ApiError(
      response.status,
      errorBody.message ?? 'API isteği tamamlanamadı.',
      errorBody.code,
      errorBody.details,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}