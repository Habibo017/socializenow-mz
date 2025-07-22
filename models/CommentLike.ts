import { Schema, models, model, type Document, type Types } from "mongoose"

export interface ICommentLike extends Document {
  _id: string
  commentId: Types.ObjectId
  userId: Types.ObjectId
  createdAt: Date
}

const CommentLikeSchema = new Schema<ICommentLike>(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const CommentLike = models.CommentLike || model<ICommentLike>("CommentLike", CommentLikeSchema)
export default CommentLike
