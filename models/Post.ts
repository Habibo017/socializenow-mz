import { Schema, models, model, type Document, type Types } from "mongoose"

export interface IPost extends Document {
  _id: string
  userId: Types.ObjectId
  content: string
  imageUrl?: string
  videoUrl?: string
  likes: number
  comments: number
  shares: number
  isPublic: boolean
  location?: string
  hashtags: string[]
  mentions: string[]
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "O conteúdo do post é obrigatório."],
      maxlength: [500, "O post não pode ter mais de 500 caracteres."],
    },
    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      maxlength: [100, "A localização não pode ter mais de 100 caracteres."],
    },
    hashtags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    mentions: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Post = models.Post || model<IPost>("Post", PostSchema)
export default Post
