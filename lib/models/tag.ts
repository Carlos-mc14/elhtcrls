// models/tag.ts
import mongoose, { type Document, type Model } from "mongoose"

export interface TagDoc extends Document {
  name: string
  slug: string
  internalId: string
  description?: string
  color?: string
  isVisible: boolean
  priceRange?: {
    min: number
    max: number
    price: number
    unit: string // "cm", "unidad", etc.
  }
  type: "category" | "size" | "care" | "location" // cactus, interiores, etc.
  createdAt: Date
  updatedAt: Date
}

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    internalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: "#10b981", // verde por defecto
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    priceRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      price: {
        type: Number,
      },
      unit: {
        type: String,
        default: "cm",
      },
    },
    type: {
      type: String,
      enum: ["category", "size", "care", "location"],
      required: true,
    },
  },
  { timestamps: true },
)

// ✅ NUEVO: Pre-hook para generar internalId automáticamente si no existe
tagSchema.pre('save', function(next) {
  if (!this.internalId && this.name && this.type) {
    const cleanName = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    
    this.internalId = `${this.type}-${cleanName}`
  }
  next()
})

// Índices para optimizar búsquedas
tagSchema.index({ slug: 1 })
tagSchema.index({ internalId: 1 })
tagSchema.index({ type: 1 })
tagSchema.index({ isVisible: 1 })
tagSchema.index({ name: 1, type: 1 }) // ✅ NUEVO: Índice compuesto para búsquedas

// Normalizar JSON para el frontend
tagSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    if (ret._id) ret._id = String(ret._id)
    if (ret.createdAt && ret.createdAt.toISOString) ret.createdAt = ret.createdAt.toISOString()
    if (ret.updatedAt && ret.updatedAt.toISOString) ret.updatedAt = ret.updatedAt.toISOString()
    return ret
  },
})

export const Tag: Model<TagDoc> = (mongoose.models.Tag as Model<TagDoc>) || mongoose.model<TagDoc>("Tag", tagSchema)