"use client"

import type React from "react"
import { useEffect } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <SessionPersistence>{children}</SessionPersistence>
    </SessionProvider>
  )
}

// Componente para mantener la persistencia de la sesión
function SessionPersistence({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Verificar la sesión periódicamente
  useEffect(() => {
    const interval = setInterval(
      () => {
        // Esto forzará una revalidación de la sesión
        if (status === "authenticated") {
          fetch("/api/auth/session")
            .then((res) => res.json())
            .catch((error) => {
              console.error("Error verificando sesión:", error)
            })
        }
      },
      5 * 60 * 1000,
    ) // Verificar cada 5 minutos

    return () => clearInterval(interval)
  }, [status])

  return <>{children}</>
}
