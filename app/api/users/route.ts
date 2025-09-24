import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models/user"
import { serializeDocument } from "@/lib/utils" // Importar serializeDocument
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean() // Agregar ordenamiento

    const serializedUsers = serializeDocument(users)

    return NextResponse.json({ users: serializedUsers })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, image } = await req.json() // Agregar role e image

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const validRoles = ["user", "editor", "admin"]
    const userRole = role && validRoles.includes(role) ? role : "user"

    // Create new user with default role "user"
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole, // Usar role validado
      image: image || "", // Agregar image
    })

    await user.save()

    // Don't return the password
    const userWithoutPassword = await User.findById(user._id).select("-password").lean()

    const serializedUser = serializeDocument(userWithoutPassword)

    return NextResponse.json({ user: serializedUser }, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
