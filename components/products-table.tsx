"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Trash, MoreHorizontal, Eye, ExternalLink, FileText, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProductsTableProps {
  products: any[]
  isAdmin: boolean
}

export function ProductsTable({ products, isAdmin }: ProductsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Estados para búsqueda, filtro y paginación
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 10
  
  // Lista de categorías disponibles
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(product => product.category)))
    return uniqueCategories.sort()
  }, [products])

  // Filtrar productos según búsqueda y categoría
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  // Calcular productos paginados
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage
    return filteredProducts.slice(startIndex, startIndex + productsPerPage)
  }, [filteredProducts, currentPage])

  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter])

  const handleDelete = async () => {
    if (!deleteProductId) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el producto")
      }

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteProductId(null)
    }
  }

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`
  }

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <>
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Filtrar por categoría" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resultados y paginación */}
      <div className="text-sm text-gray-500 mb-2">
        Mostrando {paginatedProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0} - {Math.min(currentPage * productsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
      </div>

      <div className="rounded-md border border-gray-400 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Post Vinculado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="relative h-10 w-10 rounded overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg?height=40&width=40"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.stock > 0 ? "outline" : "destructive"}
                      className={product.stock > 0 ? "border-leaf-medium text-leaf-dark" : ""}
                    >
                      {product.stock > 0 ? `${product.stock} unidades` : "Agotado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.postSlug ? (
                      <Link
                        href={`/posts/${product.postSlug}`}
                        className="flex items-center text-leaf-dark hover:underline"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="truncate max-w-[150px]">{product.postSlug}</span>
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-sm">No vinculado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tienda/${product._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Ver</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        {product.facebookUrl && (
                          <DropdownMenuItem asChild>
                            <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Ver en Facebook</span>
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeleteProductId(product._id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No hay productos disponibles {searchTerm || categoryFilter ? "con estos filtros" : ""}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Mostrar 5 páginas centradas en la actual
                let pageToShow: number;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageToShow}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-8 p-0 ${currentPage === pageToShow ? "bg-leaf-dark hover:bg-leaf-medium" : ""}`}
                    onClick={() => handlePageChange(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este producto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}