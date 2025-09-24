import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Convierte un documento de MongoDB a un objeto JavaScript plano
 * con los IDs convertidos a strings y fechas serializadas
 */
export function serializeDocument(doc: any): any {
  if (!doc) return null

  // Si es un array, convertir cada elemento
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item))
  }

  // Si es un objeto, procesar sus propiedades
  if (typeof doc === "object" && doc !== null) {
    // Manejar objetos especiales (Date, ObjectId, etc.)
    
    // Si es una fecha
    if (doc instanceof Date) {
      return doc.toISOString()
    }

    // Si es un ObjectId de MongoDB
    if (doc.constructor && doc.constructor.name === 'ObjectId') {
      return doc.toString()
    }

    // Si tiene método toJSON, usarlo (pero capturar errores)
    if (typeof doc.toJSON === 'function') {
      try {
        return serializeDocument(doc.toJSON())
      } catch (error) {
        // Si toJSON falla, procesar manualmente
        console.warn('toJSON failed, processing manually:', error)
      }
    }

    const result: any = {}

    for (const key in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, key)) {
        const value = doc[key]
        
        // Saltar funciones
        if (typeof value === 'function') {
          continue
        }

        // Convertir _id a string
        if (key === "_id" && value && typeof value.toString === "function") {
          result[key] = value.toString()
        }
        // Manejar fechas específicas
        else if (key === 'createdAt' || key === 'updatedAt') {
          if (value instanceof Date) {
            result[key] = value.toISOString()
          } else if (typeof value === 'string') {
            result[key] = value
          } else if (value && typeof value.toISOString === 'function') {
            result[key] = value.toISOString()
          } else {
            result[key] = value
          }
        }
        // Procesar objetos y arrays anidados
        else if (typeof value === "object" && value !== null) {
          result[key] = serializeDocument(value)
        }
        // Copiar valores primitivos
        else {
          result[key] = value
        }
      }
    }

    return result
  }

  return doc
}

/**
 * Serialización más robusta usando JSON como fallback
 */
export function safeSerializeDocument(doc: any): any {
  try {
    // Intentar serialización custom primero
    const customSerialized = serializeDocument(doc)
    
    // Validar que se puede serializar con JSON
    JSON.stringify(customSerialized)
    
    return customSerialized
  } catch (error) {
    console.warn('Custom serialization failed, using JSON fallback:', error)
    
    try {
      // Fallback: usar JSON.parse(JSON.stringify())
      return JSON.parse(JSON.stringify(doc))
    } catch (jsonError) {
      console.error('Complete serialization failed:', jsonError)
      return null
    }
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}