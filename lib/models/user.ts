import mongoose from "mongoose"

// Verificar si el modelo ya existe para evitar recompilación
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "editor", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)
