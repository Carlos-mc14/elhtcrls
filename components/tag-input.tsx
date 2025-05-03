"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()

    if (trimmedValue && !tags.includes(trimmedValue)) {
      const newTags = [...tags, trimmedValue]
      onChange(newTags)
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    const newTags = [...tags]
    newTags.splice(index, 1)
    onChange(newTags)
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10 cursor-text" onClick={handleContainerClick}>
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
          {tag}
          <button
            type="button"
            className="ml-1 hover:text-red-500 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Eliminar etiqueta</span>
          </button>
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-7"
        placeholder={tags.length === 0 ? "Añade etiquetas separadas por coma..." : ""}
      />
    </div>
  )
}
