import Thread from "../models/Thread.js";

const getThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user._id })
      .select("threadId title mode createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.json(threads);
  } catch (err) {
    console.error("Get threads error:", err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
};

const getThreadMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOne({ threadId, userId: req.user._id });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({
      threadId: thread.threadId,
      title: thread.title,
      mode: thread.mode,
      messages: thread.messages,
    });
  } catch (err) {
    console.error("Get thread error:", err);
    res.status(500).json({ error: "Failed to fetch thread" });
  }
};

const renameThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { title } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const thread = await Thread.findOneAndUpdate(
      { threadId, userId: req.user._id },
      { title: title.trim() },
      { new: true }
    );

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({ threadId: thread.threadId, title: thread.title });
  } catch (err) {
    console.error("Rename thread error:", err);
    res.status(500).json({ error: "Failed to rename thread" });
  }
};

const deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOneAndDelete({ threadId, userId: req.user._id });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({ success: true, message: "Thread deleted successfully" });
  } catch (err) {
    console.error("Delete thread error:", err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
};

export { getThreads, getThreadMessages, renameThread, deleteThread };
