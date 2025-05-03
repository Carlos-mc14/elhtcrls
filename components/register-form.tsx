"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Componente que usa useSearchParams
function RegisterFormContent() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor, verifica que las contraseñas sean iguales.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al registrar usuario")
      }

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      })

      // Auto login after registration
      await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo crear la cuenta. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Correo electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar contraseña
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/auth/login" className="text-green-600 hover:text-green-800 font-medium">
          Inicia sesión
        </Link>
      </div>
    </div>
  )
}

// Componente principal que envuelve el contenido en un Suspense
export function RegisterForm() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterFormContent />
    </Suspense>
  )
}
