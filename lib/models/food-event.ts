import mongoose, { Schema, type Document } from "mongoose"

export interface IFoodEvent extends Document {
  _id: string
  title: string
  description: string
  eventDate: Date
  reservationDeadline: Date
  pricePerPlate: number
  maxPlates: number
  availablePlates: number
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FoodEventSchema = new Schema<IFoodEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    reservationDeadline: {
      type: Date,
      required: true,
    },
    pricePerPlate: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPlates: {
      type: Number,
      required: true,
      min: 1,
    },
    availablePlates: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Índices para optimizar consultas
FoodEventSchema.index({ eventDate: 1 })
FoodEventSchema.index({ isActive: 1 })
FoodEventSchema.index({ reservationDeadline: 1 })

export const FoodEvent = mongoose.models.FoodEvent || mongoose.model<IFoodEvent>("FoodEvent", FoodEventSchema)
