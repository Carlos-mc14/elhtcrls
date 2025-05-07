"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const isAdmin = session?.user.role === "admin"

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true,
    },
    {
      title: "Publicaciones",
      href: "/admin/posts",
      icon: <FileText className="h-5 w-5" />,
      exact: false,
    },
    {
      title: "Productos",
      href: "/admin/products",
      icon: <ShoppingBag className="h-5 w-5" />,
      exact: false,
    },
    ...(isAdmin
      ? [
          {
            title: "Usuarios",
            href: "/admin/users",
            icon: <Users className="h-5 w-5" />,
            exact: false,
          },
        ]
      : []),
  ]

  return (
    <div
      className={cn("bg-white border-r h-screen sticky top-0 transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="font-bold text-xl text-lime-800">
              Panel de Control
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                          : "hover:bg-gray-100",
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          {!collapsed && (
            <div className="text-xs text-gray-500">
              Conectado como: <span className="font-medium">{session?.user.name}</span>
              <div className="mt-1 text-xs">{session?.user.role === "admin" ? "Administrador" : "Editor"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
