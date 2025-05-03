import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Convierte un documento de MongoDB a un objeto JavaScript plano
 * con los IDs convertidos a strings
 */
export function serializeDocument(doc: any): any {
  if (!doc) return null

  // Si es un array, convertir cada elemento
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item))
  }

  // Si es un objeto, procesar sus propiedades
  if (typeof doc === "object" && doc !== null) {
    const result: any = {}

    for (const key in doc) {
      // Convertir _id a string
      if (key === "_id" && doc[key] && typeof doc[key].toString === "function") {
        result[key] = doc[key].toString()
      }
      // Procesar objetos anidados
      else if (typeof doc[key] === "object" && doc[key] !== null) {
        result[key] = serializeDocument(doc[key])
      }
      // Copiar valores primitivos
      else {
        result[key] = doc[key]
      }
    }

    return result
  }

  return doc
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
