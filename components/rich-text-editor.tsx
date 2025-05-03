"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ImageGallery } from "@/components/image-gallery"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, LinkIcon, ImageIcon } from "lucide-react"

interface RichTextEditorProps {
  initialContent?: string
  onChange: (content: string) => void
}

export function RichTextEditor({ initialContent = "", onChange }: RichTextEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    onChange(e.target.value)
  }

  const insertAtCursor = (before: string, after = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newText)
    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const handleImageSelect = (imagePath: string) => {
    insertAtCursor(`![Imagen](${imagePath})`, "")
    setIsGalleryOpen(false)
  }

  const formatters = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: "Negrita",
      action: () => insertAtCursor("**", "**"),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: "Cursiva",
      action: () => insertAtCursor("*", "*"),
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: "Título 1",
      action: () => insertAtCursor("# ", ""),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: "Título 2",
      action: () => insertAtCursor("## ", ""),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: "Título 3",
      action: () => insertAtCursor("### ", ""),
    },
    {
      icon: <List className="h-4 w-4" />,
      label: "Lista",
      action: () => insertAtCursor("- ", ""),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: "Lista numerada",
      action: () => insertAtCursor("1. ", ""),
    },
    {
      icon: <LinkIcon className="h-4 w-4" />,
      label: "Enlace",
      action: () => insertAtCursor("[", "](url)"),
    },
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: "Imagen",
      action: () => setIsGalleryOpen(true),
    },
  ]

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        {formatters.map((formatter, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatter.action}
            title={formatter.label}
          >
            {formatter.icon}
            <span className="sr-only">{formatter.label}</span>
          </Button>
        ))}
      </div>

      <Textarea
        value={content}
        onChange={handleChange}
        className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Escribe el contenido de tu publicación aquí..."
      />

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0">
          <ImageGallery onSelectImage={handleImageSelect} onClose={() => setIsGalleryOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
