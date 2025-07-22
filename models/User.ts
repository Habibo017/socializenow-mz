import { Schema, models, model, type Document } from "mongoose"

// Interface para o documento do usuário (baseada na sua estrutura real)
export interface IUser extends Document {
  _id: string
  name: string // Campo 'name' ao invés de 'username'
  email: string
  password: string
  username: string // Handle do usuário (@username)
  avatar?: string // URL do avatar no Cloudinary
  bio?: string
  followers?: number
  following?: number
  isVerified?: boolean // Selo de verificação
  userEmailVerified?: boolean // Se o email foi verificado
  createdAt: Date
  updatedAt: Date
}

// Schema do usuário (correspondendo à sua estrutura)
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Por favor, forneça um nome."],
      trim: true,
      maxlength: [100, "O nome não pode ter mais de 100 caracteres."],
    },
    email: {
      type: String,
      required: [true, "Por favor, forneça um email."],
      unique: true,
      match: [/.+@.+\..+/, "Por favor, forneça um email válido."],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    username: {
      type: String,
      required: [true, "Por favor, forneça um username."],
      unique: true,
      trim: true,
      maxlength: [30, "O username não pode ter mais de 30 caracteres."],
    },
    avatar: {
      type: String,
      default: "/placeholder.svg?height=96&width=96",
    },
    bio: {
      type: String,
      maxlength: [200, "A biografia não pode ter mais de 200 caracteres."],
      default: "",
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const User = models.User || model<IUser>("User", UserSchema)
export default User
