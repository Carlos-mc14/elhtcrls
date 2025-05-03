import mongoose from "mongoose"

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
  },
  { timestamps: true },
)

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
