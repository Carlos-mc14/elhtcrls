import { cache } from "react"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models/user"

// Función auxiliar para convertir _id de MongoDB a string
function convertMongoIds(obj: any): any {
  if (!obj) return obj

  // Si es un array, convertir cada elemento
  if (Array.isArray(obj)) {
    return obj.map((item) => convertMongoIds(item))
  }

  // Si es un objeto, procesar sus propiedades
  if (typeof obj === "object") {
    const result: any = {}

    for (const key in obj) {
      // Convertir _id a string
      if (key === "_id") {
        result._id = obj._id.toString()
      }
      // Procesar objetos anidados
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        result[key] = convertMongoIds(obj[key])
      }
      // Copiar valores primitivos
      else {
        result[key] = obj[key]
      }
    }

    return result
  }

  return obj
}

export const getUsers = cache(async () => {
  await connectToDatabase()

  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean()

  // Convertir los IDs de MongoDB a strings
  return convertMongoIds(users)
})

export const getUserById = cache(async (id: string) => {
  await connectToDatabase()

  const user = await User.findById(id).select("-password").lean()

  // Convertir los IDs de MongoDB a strings
  return user ? convertMongoIds(user) : null
})
