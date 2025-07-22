import { Schema, models, model } from "mongoose"

// Defina a interface para o documento do usuário
export interface IUser extends Document {
  username: string
  handle: string // O @handle do usuário
  email: string
  bio?: string
  followers?: number
  following?: number
  avatarSrc?: string
  backgroundSrc?: string
  createdAt: Date
  updatedAt: Date
}

// Defina o esquema do usuário
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Por favor, forneça um nome de usuário."],
      unique: true,
      trim: true,
      maxlength: [50, "O nome de usuário não pode ter mais de 50 caracteres."],
    },
    handle: {
      type: String,
      required: [true, "Por favor, forneça um handle."],
      unique: true,
      trim: true,
      maxlength: [30, "O handle não pode ter mais de 30 caracteres."],
    },
    email: {
      type: String,
      required: [true, "Por favor, forneça um email."],
      unique: true,
      match: [/.+@.+\..+/, "Por favor, forneça um email válido."],
    },
    password: {
      type: String,
      required: true,
      select: false, // Não retorna a senha por padrão em consultas
    },
    bio: {
      type: String,
      maxlength: [200, "A biografia não pode ter mais de 200 caracteres."],
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    avatarSrc: {
      type: String,
    },
    backgroundSrc: {
      type: String,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  },
)

// Exporta o modelo. Se o modelo já existe, reutiliza-o. Caso contrário, cria um novo.
const User = models.User || model<IUser>("User", UserSchema)

export default User
