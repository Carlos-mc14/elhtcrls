"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Database, X } from "lucide-react"

export function DatabaseMonitor() {
  const [status, setStatus] = useState<{
    mongodb: string
    redis: boolean
    cacheStats: {
      hits: number
      misses: number
      keys: number
    }
  }>({
    mongodb: "desconocido",
    redis: false,
    cacheStats: {
      hits: 0,
      misses: 0,
      keys: 0,
    },
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/system/status")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        throw new Error("Error al obtener estado del sistema")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener el estado del sistema",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      const response = await fetch("/api/system/cache", {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Caché limpiada",
          description: "La caché ha sido limpiada correctamente",
        })
        fetchStatus()
      } else {
        throw new Error("Error al limpiar caché")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo limpiar la caché",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchStatus()

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">MongoDB:</span>
            </div>
            <span
              className={`text-sm font-medium ${
                status.mongodb === "connected"
                  ? "text-green-500"
                  : status.mongodb === "connecting"
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              {status.mongodb === "connected"
                ? "Conectado"
                : status.mongodb === "connecting"
                  ? "Conectando..."
                  : "Desconectado"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Redis:</span>
            <span className={`text-sm font-medium ${status.redis ? "text-green-500" : "text-red-500"}`}>
              {status.redis ? "Disponible" : "No disponible"}
            </span>
          </div>

          {status.redis && (
            <>
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Estadísticas de Caché</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-100 p-2 rounded">
                    <div className="text-lg font-bold">{status.cacheStats.hits}</div>
                    <div className="text-xs text-gray-500">Aciertos</div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <div className="text-lg font-bold">{status.cacheStats.misses}</div>
                    <div className="text-xs text-gray-500">Fallos</div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <div className="text-lg font-bold">{status.cacheStats.keys}</div>
                    <div className="text-xs text-gray-500">Claves</div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-2" onClick={clearCache}>
                  <X className="mr-2 h-3 w-3" />
                  Limpiar caché
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
