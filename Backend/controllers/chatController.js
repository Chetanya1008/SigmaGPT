import Thread from "../models/Thread.js";
import { getGeminiResponse, generateThreadTitle } from "../services/geminiService.js";
import { getAttachmentMeta } from "../middleware/uploadMiddleware.js";

const sendMessage = async (req, res) => {
  try {
    const { threadId, message, mode = "general" } = req.body;
    const userId = req.user._id;
    const files = req.files || [];
    console.log("========== CHAT REQUEST ==========");
console.log("Message:", req.body.message);
console.log("Thread ID:", req.body.threadId);
console.log("Files received:", req.files);
console.log("Number of files:", req.files?.length || 0);

    if (!threadId || !message?.trim()) {
      return res.status(400).json({ error: "threadId and message are required" });
    }

    if (message.length > 10000) {
      return res.status(400).json({ error: "Message is too long (max 10,000 characters)" });
    }

    const attachmentsMeta = files.map(getAttachmentMeta);

    let thread = await Thread.findOne({ threadId, userId });

    if (!thread) {
      const title = await generateThreadTitle(message);
      thread = new Thread({
        threadId,
        userId,
        title,
        mode,
        messages: [{
          role: "user",
          content: message,
          attachments: attachmentsMeta,
        }],
      });
    } else {
      thread.messages.push({
        role: "user",
        content: message,
        attachments: attachmentsMeta,
      });
      if (thread.mode !== mode) {
        thread.mode = mode;
      }
    }

    const recentMessages = thread.messages.slice(-20).map((msg, idx, arr) => {
  const message = {
    role: msg.role,
    content: msg.content,
    attachments: msg.attachments || [],
  };

  const isLatestUser =
    idx === arr.length - 1 &&
    msg.role === "user";

  if (isLatestUser && files.length > 0) {
    message.attachments = files.map((file) => ({
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype === "application/pdf"
        ? "document"
        : "file",
      _fileBuffer: file.buffer,
    }));
  }

  return message;
});

    const assistantReply = await getGeminiResponse(recentMessages, thread.mode);

    thread.messages.push({ role: "assistant", content: assistantReply });
    await thread.save();

    res.json({
      reply: assistantReply,
      title: thread.title,
      threadId: thread.threadId,
      attachments: attachmentsMeta,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Failed to get AI response" });
  }
};

export { sendMessage };
