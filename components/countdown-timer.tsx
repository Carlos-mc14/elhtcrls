"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: string
  onExpired?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ targetDate, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((difference / 1000 / 60) % 60)
        const seconds = Math.floor((difference / 1000) % 60)

        setTimeLeft({ days, hours, minutes, seconds })
        setIsExpired(false)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (!isExpired) {
          setIsExpired(true)
          if (typeof window !== "undefined") {
            window.location.reload()
          }
          onExpired?.()
        }
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, isExpired, onExpired])

  if (isExpired) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-xl font-bold text-red-600 mb-2">Tiempo Agotado</h3>
        <p className="text-red-500">El tiempo para hacer reservas ha terminado</p>
      </div>
    )
  }

  return (
    <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tiempo restante para reservar</h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{timeLeft.days}</div>
          <div className="text-sm text-gray-600">Días</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{timeLeft.hours}</div>
          <div className="text-sm text-gray-600">Horas</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{timeLeft.minutes}</div>
          <div className="text-sm text-gray-600">Minutos</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{timeLeft.seconds}</div>
          <div className="text-sm text-gray-600">Segundos</div>
        </div>
      </div>
    </div>
  )
}
