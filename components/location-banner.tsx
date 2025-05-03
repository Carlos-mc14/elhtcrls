"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Facebook, Phone } from "lucide-react"

export function LocationBanner() {
  const [isInPeru, setIsInPeru] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkLocation = async () => {
      try {
        // En un entorno real, usaríamos un servicio de geolocalización
        // Aquí simulamos la detección para demostración
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()

        setIsInPeru(data.country_code === "PE")
      } catch (error) {
        console.error("Error al detectar ubicación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLocation()
  }, [])

  if (isLoading) {
    return null
  }

  if (!isInPeru) {
    return null
  }

  return (

    <div>

        
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-blue-800">¡Oferta especial para Perú!</h3>
            <p className="text-blue-700">
              Visita nuestra tienda en Facebook para descuentos exclusivos y envío gratuito.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Facebook className="mr-2 h-4 w-4" />
            Visitar Tienda de Facebook
          </Button>
        </div>
      </div>


      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-green-800">¡Unidos por las plantas!</h3>
            <p className="text-green-700">
              Escribenos a nuestro WhatsApp para recibir atención personalizada y ofertas exclusivas.
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Phone className="mr-2 h-4 w-4" />
            Chatea Con Nosotros
          </Button>
        </div>
      </div>
      <br />
      <br />
    </div>
  )
}
