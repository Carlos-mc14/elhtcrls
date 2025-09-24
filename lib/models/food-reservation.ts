import mongoose, { Schema, type Document } from "mongoose"

export interface IFoodReservation extends Document {
  _id: string
  eventId: mongoose.Types.ObjectId
  customerName: string
  customerPhone: string
  customerEmail?: string
  numberOfPlates: number
  totalAmount: number
  status: "pending" | "confirmed" | "cancelled"
  whatsappMessageSent: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const FoodReservationSchema = new Schema<IFoodReservation>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "FoodEvent",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    numberOfPlates: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    whatsappMessageSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Índices para optimizar consultas
FoodReservationSchema.index({ eventId: 1 })
FoodReservationSchema.index({ status: 1 })
FoodReservationSchema.index({ createdAt: -1 })

export const FoodReservation =
  mongoose.models.FoodReservation || mongoose.model<IFoodReservation>("FoodReservation", FoodReservationSchema)
