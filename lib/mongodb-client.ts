import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
}

// Interfaz para el objeto de conexión en caché
interface CachedMongoClient {
  client: MongoClient | null
  promise: Promise<MongoClient> | null
  lastUsed: number
}

// Tiempo de inactividad en ms antes de cerrar la conexión (5 minutos)
const IDLE_TIMEOUT = 5 * 60 * 1000

// Declaración para el objeto global
declare global {
  var mongoClientPromise:
    | {
        client: MongoClient | null
        promise: Promise<MongoClient> | null
        lastUsed: number
      }
    | undefined
}

// Inicializar el objeto de caché
const cached: CachedMongoClient = global.mongoClientPromise || {
  client: null,
  promise: null,
  lastUsed: Date.now(),
}

// Guardar en el objeto global para persistencia entre recargas en desarrollo
if (!global.mongoClientPromise) {
  global.mongoClientPromise = cached
}

// Función para cerrar conexiones inactivas
async function closeIdleConnections() {
  const currentTime = Date.now()

  if (cached.client && currentTime - cached.lastUsed > IDLE_TIMEOUT) {
    console.log("Cerrando conexión inactiva a MongoDB")
    await cached.client.close()
    cached.client = null
    cached.promise = null
  }
}

// Programar verificación periódica de conexiones inactivas (cada minuto)
if (typeof window === "undefined") {
  // Solo en el servidor
  setInterval(closeIdleConnections, 60 * 1000)
}

// Función para obtener el cliente de MongoDB
export async function getMongoClient(): Promise<MongoClient> {
  // Actualizar timestamp de último uso
  cached.lastUsed = Date.now()

  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri, options).then((client) => {
      console.log("MongoDB conectado exitosamente (MongoClient)")
      return client
    })
  }

  try {
    cached.client = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.client
}

// Exportar la promesa del cliente para el adaptador de Auth.js
const clientPromise = getMongoClient()
export default clientPromise
