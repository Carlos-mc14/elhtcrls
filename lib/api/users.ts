import { cache } from "react"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models/user"
import { serializeDocument } from "@/lib/utils"

export const getUsers = cache(async () => {
  await connectToDatabase()

  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean()

  return serializeDocument(users)
})

export const getUserById = cache(async (id: string) => {
  await connectToDatabase()

  const user = await User.findById(id).select("-password").lean()

  return user ? serializeDocument(user) : null
})
