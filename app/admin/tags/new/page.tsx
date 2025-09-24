"use client"

import { TagForm } from "@/components/tag-form"

export default function NewTagPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Nueva Etiqueta</h1>
      </div>
      <TagForm />
    </div>
  )
}
