import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ILike extends Document {
  userId: Types.ObjectId
  postId: Types.ObjectId
  createdAt: Date
}

const LikeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

// Garante que um usuário só possa curtir um post uma vez
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true })

const Like = mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema)

export default Like
