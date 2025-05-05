import { cache } from "react"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"

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

export const getProducts = cache(async ({ page = 1, limit = 8 } = {}) => {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const products = await Product.find()
                     .sort({ createdAt: -1 })
                     .skip(skip)
                     .limit(limit)
                     .lean();
  return convertMongoIds(products);
});

export const getProductById = cache(async (id: string) => {
  try {
    await connectToDatabase()

    const product = await Product.findById(id).lean()

    // Convertir los IDs de MongoDB a strings
    return product ? convertMongoIds(product) : null
  } catch (error) {
    console.error("Error al obtener producto por ID:", error)
    return null
  }
})

export const getProductsByCategory = cache(async (category: string) => {
  try {
    await connectToDatabase()

    const products = await Product.find({ category }).sort({ createdAt: -1 }).lean()

    // Convertir los IDs de MongoDB a strings
    return convertMongoIds(products)
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error)
    return []
  }
})
