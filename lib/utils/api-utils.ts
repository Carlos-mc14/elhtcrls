/**
 * Utilidad centralizada para obtener la URL base de la API
 * Garantiza consistencia en todas las llamadas a la API
 */
export function getApiBaseUrl(): string {
  // En producción, usar NEXT_PUBLIC_BASE_URL
  // En desarrollo, usar localhost como fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  // Remover slash final si existe para evitar URLs duplicadas
  return baseUrl.replace(/\/$/, "")
}

/**
 * Construye una URL completa para llamadas a la API
 * @param path - Ruta de la API (ej: "/api/products")
 * @param params - Parámetros de consulta opcionales
 */
export function buildApiUrl(path: string, params?: URLSearchParams): string {
  const baseUrl = getApiBaseUrl()
  const queryString = params?.toString()

  // Asegurar que el path comience con /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ""}`
}
