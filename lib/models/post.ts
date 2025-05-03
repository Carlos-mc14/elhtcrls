import mongoose from "mongoose"

const diaryEntrySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
  },
  { _id: true },
)

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
)

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    diaryEntries: {
      type: [diaryEntrySchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema)
