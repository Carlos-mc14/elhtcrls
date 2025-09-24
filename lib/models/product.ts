// models/products.ts
import mongoose, { type Document, type Model } from "mongoose"

export interface ProductDoc extends Document {
  name: string
  description: string
  price: number
  image: string
  additionalImages: string[]
  category: string
  stock: number
  facebookUrl: string
  postSlug: string
  tags: mongoose.Types.ObjectId[]
  tagStock: Array<{
    tagId: mongoose.Types.ObjectId
    stock: number
  }>
  createdAt: Date
  updatedAt: Date
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    facebookUrl: {
      type: String,
      default: "",
    },
    postSlug: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    tagStock: [
      {
        tagId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tag",
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true },
)

// Opcional: normalizar JSON para el frontend (convierte _id a string y fechas a ISO)
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    if (ret._id) ret._id = String(ret._id)
    if (ret.createdAt && ret.createdAt.toISOString) ret.createdAt = ret.createdAt.toISOString()
    if (ret.updatedAt && ret.updatedAt.toISOString) ret.updatedAt = ret.updatedAt.toISOString()
    return ret
  },
})

export const Product: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) || mongoose.model<ProductDoc>("Product", productSchema)
