import { Schema, models, model, type Document, type Types } from "mongoose"

export interface INotification extends Document {
  _id: string
  userId: Types.ObjectId // Usuário que receberá a notificação
  fromUserId: Types.ObjectId // Usuário que gerou a notificação
  type: "like" | "comment" | "follow" | "mention" | "message"
  postId?: Types.ObjectId
  commentId?: Types.ObjectId
  content: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "mention", "message"],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    content: {
      type: String,
      required: true,
      maxlength: [200, "O conteúdo da notificação não pode ter mais de 200 caracteres."],
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

const Notification = models.Notification || model<INotification>("Notification", NotificationSchema)
export default Notification
