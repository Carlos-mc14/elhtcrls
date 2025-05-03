"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Suspense } from 'react'

interface SearchBarProps {
  defaultValue?: string
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    startTransition(() => {
      router.push(`/posts?${params.toString()}`)
    })
  }

  const clearSearch = () => {
    setSearchQuery("")

    const params = new URLSearchParams(searchParams)
    params.delete("q")

    startTransition(() => {
      router.push(`/posts?${params.toString()}`)
    })
  }

  return (
    <Suspense>

    
    <form onSubmit={handleSearch} className="relative w-full">
      <Input
        type="search"
        placeholder="Buscar publicaciones..."
        className="w-full pr-16"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-8 top-0 h-10 w-10"
          onClick={clearSearch}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpiar búsqueda</span>
        </Button>
      )}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-10 w-10"
        disabled={isPending}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Buscar</span>
      </Button>
    </form>
    </Suspense>
  )
}
