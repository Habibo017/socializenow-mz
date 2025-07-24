import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ICommentLike extends Document {
  userId: Types.ObjectId
  commentId: Types.ObjectId
  createdAt: Date
}

const CommentLikeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

// Garante que um usuário só possa curtir um comentário uma vez
CommentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true })

const CommentLike = mongoose.models.CommentLike || mongoose.model<ICommentLike>("CommentLike", CommentLikeSchema)

export default CommentLike
