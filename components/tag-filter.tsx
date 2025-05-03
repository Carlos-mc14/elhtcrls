"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Suspense } from 'react'

interface TagFilterProps {
  selectedTag?: string
}

export function TagFilter({ selectedTag = "" }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tags = [
    "Plantas de Interior",
    "Plantas de Exterior",
    "Suculentas",
    "Cactus",
    "Hierbas",
    "Hortalizas",
    "Frutales",
    "Flores",
    "Bonsái",
  ]

  const handleTagChange = (value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value) {
      params.set("tag", value)
    } else {
      params.delete("tag")
    }

    router.push(`/posts?${params.toString()}`)
  }

  return (
    <Suspense>
    <Select value={selectedTag} onValueChange={handleTagChange}>
      <SelectTrigger>
        <SelectValue placeholder="Filtrar por etiqueta" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las etiquetas</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    </Suspense>
  )
}
