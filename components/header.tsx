"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchBar } from "@/components/search-bar"
import { Menu, X, LogOut, User, Settings, Leaf, Home, ShoppingBag, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar mobile menu cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: "Inicio", href: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Blog", href: "/posts", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { name: "Tienda", href: "/tienda", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className={`sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
        scrolled ? "shadow-md bg-white/90" : "bg-white/50"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center" aria-label="El Huerto De Carlos - Página de inicio">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="mr-2 bg-gradient-green p-2 rounded-full"
            >
              <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
            </motion.div>
            <motion.span
              className="text-xl font-bold text-gradient-green"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              El Huerto De Carlos
            </motion.span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative group focus-visible-ring rounded-md"
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`text-sm font-medium transition-colors flex items-center ${
                    isActive ? "text-leaf-dark" : "text-foreground hover:text-leaf-medium"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-green"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            )
          })}

          <div className="w-64">
            <SearchBar />
          </div>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-leaf-light hover:border-leaf-medium transition-colors duration-300 focus-visible-ring"
                  aria-label="Menú de usuario"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "Avatar de usuario"} />
                    <AvatarFallback className="bg-gradient-green text-white">
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 border border-leaf-light/20 shadow-lg shadow-leaf-dark/10"
                align="end"
                forceMount
              >
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {(session.user.role === "admin" || session.user.role === "editor") && (
                  <DropdownMenuItem asChild className="hover:bg-leaf-light/10 focus:bg-leaf-light/10 cursor-pointer">
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4 text-leaf-medium" aria-hidden="true" />
                      <span>Panel de Administración</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="hover:bg-leaf-light/10 focus:bg-leaf-light/10 cursor-pointer">
                  <Link href="/perfil">
                    <User className="mr-2 h-4 w-4 text-leaf-medium" aria-hidden="true" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="hover:bg-leaf-light/20 hover:text-leaf-dark transition-colors focus-visible-ring"
              >
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-green hover:brightness-110 text-white shadow-md hover:shadow-lg transition-all duration-300 focus-visible-ring"
              >
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-leaf-light/20 focus-visible-ring"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-leaf-dark" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6 text-leaf-dark" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t bg-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto py-4 grid gap-4 px-4">
              <SearchBar />

              <nav className="grid gap-2">
                {navItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center focus-visible-ring ${
                        isActive
                          ? "bg-gradient-to-r from-leaf-light/20 to-leaf-medium/20 text-leaf-dark border-l-4 border-leaf-medium"
                          : "hover:bg-leaf-light/10 hover:border-l-4 hover:border-leaf-light"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {!session && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    asChild
                    className="border-leaf-light hover:border-leaf-medium hover:bg-leaf-light/10 focus-visible-ring"
                  >
                    <Link href="/auth/login">Iniciar Sesión</Link>
                  </Button>
                  <Button asChild className="bg-gradient-green hover:brightness-110 text-white focus-visible-ring">
                    <Link href="/auth/register">Registrarse</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
