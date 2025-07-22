import { Schema, models, model, type Document, type Types } from "mongoose"

export interface IMessage extends Document {
  _id: string
  senderId: Types.ObjectId
  receiverId: Types.ObjectId
  content: string
  imageUrl?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "O conteúdo da mensagem é obrigatório."],
      maxlength: [1000, "A mensagem não pode ter mais de 1000 caracteres."],
    },
    imageUrl: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Message = models.Message || model<IMessage>("Message", MessageSchema)
export default Message
