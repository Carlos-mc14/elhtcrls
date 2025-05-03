import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formatea una fecha de manera segura
 * @param dateString Fecha en formato string o Date
 * @param formatStr Formato de salida (usando date-fns)
 * @param defaultValue Valor por defecto si la fecha es inválida
 * @returns Fecha formateada o valor por defecto
 */
export function formatDate(
  dateString: string | Date | undefined | null,
  formatStr = "d 'de' MMMM, yyyy",
  defaultValue = "Fecha no disponible",
): string {
  if (!dateString) return defaultValue

  try {
    // Si es string, intentar parsear
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return defaultValue
    }

    return format(date, formatStr, { locale: es })
  } catch (error) {
    console.error("Error al formatear fecha:", error, dateString)
    return defaultValue
  }
}

/**
 * Convierte una fecha a formato ISO para almacenar en la base de datos
 * @param date Fecha a convertir
 * @returns Fecha en formato ISO o null si es inválida
 */
export function toISODate(date: Date | string | undefined | null): string | null {
  if (!date) return null

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return null
    }

    return dateObj.toISOString()
  } catch (error) {
    console.error("Error al convertir fecha a ISO:", error)
    return null
  }
}
