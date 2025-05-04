"use client"

import type React from "react"

// Este archivo es generado por shadcn/ui y no debería necesitar modificaciones
// Sin embargo, vamos a asegurarnos de que esté correctamente implementado

import { useEffect, useState } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 500000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toasts: ToasterToast[] = []

type Toast = Omit<ToasterToast, "id">

function addToast(toast: Toast) {
  const id = genId()

  const newToast = {
    ...toast,
    id,
  }

  toasts.push(newToast)

  return id
}

function removeToast(id: string) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
  }
}

export function useToast() {
  const [mounted, setMounted] = useState(false)
  const [toastState, setToastState] = useState<ToasterToast[]>([])

  useEffect(() => {
    setMounted(true)

    // Actualizar el estado cuando cambian los toasts
    const interval = setInterval(() => {
      setToastState([...toasts])
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return {
      toast: (props: Toast) => {
        addToast(props)
      },
      dismiss: (id: string) => {
        removeToast(id)
      },
      toasts: [],
    }
  }

  return {
    toast: (props: Toast) => {
      const id = addToast(props)

      // Eliminar automáticamente después de un tiempo
      setTimeout(() => {
        removeToast(id)
      }, TOAST_REMOVE_DELAY)

      return id
    },
    dismiss: (id: string) => {
      removeToast(id)
    },
    toasts: toastState,
  }
}
