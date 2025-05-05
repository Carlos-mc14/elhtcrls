"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlProps {
  currentPage: number
  totalPages: number
}

export function PaginationControl({ currentPage, totalPages }: PaginationControlProps) {
  const router = useRouter()
  const pathname = usePathname()

  const goToPage = (page: number) => {
    router.push(`${pathname}?page=${page}`)
  }

  const renderPageButtons = () => {
    const buttons = []
    const maxButtons = 5 // Número máximo de botones a mostrar

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    // Botón para la primera página
    if (startPage > 1) {
      buttons.push(
        <Button key="first" variant="outline" onClick={() => goToPage(1)} className="h-8 w-8 p-0">
          1
        </Button>,
      )
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="px-2">
            ...
          </span>,
        )
      }
    }

    // Botones de páginas
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          onClick={() => goToPage(i)}
          className={`h-8 w-8 p-0 ${i === currentPage ? "bg-leaf-dark hover:bg-leaf-medium" : ""}`}
        >
          {i}
        </Button>,
      )
    }

    // Botón para la última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="px-2">
            ...
          </span>,
        )
      }
      buttons.push(
        <Button key="last" variant="outline" onClick={() => goToPage(totalPages)} className="h-8 w-8 p-0">
          {totalPages}
        </Button>,
      )
    }

    return buttons
  }

  return (
    <div className="flex justify-center items-center space-x-2 py-4">
      <Button
        variant="outline"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageButtons()}

      <Button
        variant="outline"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
