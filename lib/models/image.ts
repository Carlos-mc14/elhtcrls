import mongoose, { type Document, Schema } from "mongoose"

// Definir una interfaz para el documento de imagen
export interface IImage extends Document {
  filename: string
  originalName: string
  path: string
  size: number
  mimetype: string
  user: mongoose.Types.ObjectId
  isPublic: boolean
  width: number
  height: number
  tags: string[]
  blobUrl?: string
  createdAt: Date
  updatedAt: Date
}

const imageSchema = new Schema<IImage>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    blobUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
)

export const Image = mongoose.models.Image || mongoose.model<IImage>("Image", imageSchema)
