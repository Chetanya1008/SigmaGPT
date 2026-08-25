import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, enum: ["image", "document"], required: true },
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [AttachmentSchema],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ThreadSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "New Chat",
  },
  mode: {
    type: String,
    enum: ["general", "coding", "resume", "interview", "study"],
    default: "general",
  },
  messages: [MessageSchema],
}, { timestamps: true });

ThreadSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model("Thread", ThreadSchema);
