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

// Opción 1: Cargar todos los productos de una vez (para catálogos pequeños a medianos)
export const getProducts = cache(async () => {
  await connectToDatabase();
  const products = await Product.find()
                     .sort({ createdAt: -1 })
                     .lean();
  return convertMongoIds(products);
});

// Opción 2: Mantener paginación en el servidor (para catálogos muy grandes)
// export const getProducts = cache(async ({ 
//   page = 1, 
//   limit = 50, // Aumentamos el límite por defecto
//   search = "",
//   category = ""
// } = {}) => {
//   await connectToDatabase();
//   
//   // Construir el filtro
//   const filter: any = {};
//   
//   // Añadir filtro de búsqueda si existe
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: 'i' } },
//       { description: { $regex: search, $options: 'i' } }
//     ];
//   }
//   
//   // Añadir filtro de categoría si existe
//   if (category && category !== "all") {
//     filter.category = category;
//   }
//   
//   // Calcular el salto para la paginación
//   const skip = (page - 1) * limit;
//   
//   // Obtener productos con filtros
//   const products = await Product.find(filter)
//                      .sort({ createdAt: -1 })
//                      .skip(skip)
//                      .limit(limit)
//                      .lean();
//   
//   // Obtener conteo total para la paginación
//   const total = await Product.countDocuments(filter);
//   
//   return {
//     products: convertMongoIds(products),
//     pagination: {
//       total,
//       pages: Math.ceil(total / limit),
//       page,
//       limit
//     }
//   };
// });

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

// Nueva función para buscar productos (útil si necesitamos operaciones de búsqueda en el servidor)
export const searchProducts = cache(async (query: string) => {
  try {
    await connectToDatabase()

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .lean()

    return convertMongoIds(products)
  } catch (error) {
    console.error("Error al buscar productos:", error)
    return []
  }
})