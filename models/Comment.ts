import { Schema, models, model, type Document, type Types } from "mongoose"

export interface IComment extends Document {
  _id: string
  postId: Types.ObjectId
  userId: Types.ObjectId
  content: string
  likes: number
  parentCommentId?: Types.ObjectId // Para respostas a comentários
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "O conteúdo do comentário é obrigatório."],
      maxlength: [300, "O comentário não pode ter mais de 300 caracteres."],
    },
    likes: {
      type: Number,
      default: 0,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  },
)

const Comment = models.Comment || model<IComment>("Comment", CommentSchema)
export default Comment
