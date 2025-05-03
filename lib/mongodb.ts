import mongoose from "mongoose"
import { getMongoClient } from "./mongodb-client"

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Interfaz para el objeto de conexión en caché
interface CachedMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  lastUsed: number
}

// Declaración para el objeto global
declare global {
  var mongooseConnection: CachedMongoose | undefined
}

// Inicializar el objeto de caché
const cached: CachedMongoose = global.mongooseConnection || {
  conn: null,
  promise: null,
  lastUsed: Date.now(),
}

// Guardar en el objeto global para persistencia entre recargas en desarrollo
if (!global.mongooseConnection) {
  global.mongooseConnection = cached
}

export async function connectToDatabase() {
  // Actualizar timestamp de último uso
  cached.lastUsed = Date.now()

  if (cached.conn) {
    // Verificar si la conexión está en buen estado
    if (cached.conn.connection.readyState === 1) {
      return cached.conn
    }
    // Si la conexión no está en buen estado, cerrarla y crear una nueva
    console.log("Conexión a MongoDB en mal estado, reconectando...")
    await cached.conn.disconnect()
    cached.conn = null
    cached.promise = null
  }

  if (!cached.promise) {
    // Asegurarse de que el cliente de MongoDB esté conectado
    await getMongoClient()

    const opts = {
      bufferCommands: false,
      dbName: new URL(process.env.MONGODB_URI!).pathname.substring(1) || "plant-blog",
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then((mongoose) => {
      console.log("MongoDB conectado exitosamente (Mongoose)")

      // Configurar eventos para monitoreo de conexión
      mongoose.connection.on("error", (err) => {
        console.error("Error en conexión MongoDB:", err)
      })

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB desconectado")
        cached.conn = null
      })

      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Función para cerrar explícitamente la conexión
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await cached.conn.disconnect()
    cached.conn = null
    cached.promise = null
    console.log("Conexión a MongoDB cerrada explícitamente")
  }
}

// Función para verificar el estado de la conexión
export function getConnectionStatus() {
  if (!cached.conn) return "disconnected"

  const states = ["disconnected", "connected", "connecting", "disconnecting"]
  return states[cached.conn.connection.readyState]
}
