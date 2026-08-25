import { createContext, useContext, useState, useCallback } from "react";
import { chatAPI, threadAPI } from "../services/api.js";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("general");
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const fetchThreads = useCallback(async () => {
    try {
      const data = await threadAPI.getThreads();
      setThreads(data);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  }, []);

  const loadThread = useCallback(async (threadId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await threadAPI.getThread(threadId);
      setCurrentThread(data);
      setMessages(data.messages || []);
      if (data.mode) setMode(data.mode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (threadId, message, attachments = []) => {
    try {
      setLoading(true);
      setAwaitingReply(true);
      setError(null);

      const attachmentMeta = attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type.startsWith("image/") ? "image" : "document",
        mimeType: f.type,
      }));

      const userMsg = {
        role: "user",
        content: message,
        attachments: attachmentMeta.length ? attachmentMeta : undefined,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg]);

      const data = await chatAPI.sendMessage(threadId, message, mode, attachments);

      const assistantMsg = { role: "assistant", content: data.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
      setAwaitingReply(false);

      setCurrentThread(prev => prev ? { ...prev, title: data.title, mode } : {
        threadId: data.threadId,
        title: data.title,
        mode,
        messages: [userMsg, assistantMsg],
      });

      await fetchThreads();

      return data;
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.slice(0, -1));
      setAwaitingReply(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mode, fetchThreads]);

  const newChat = useCallback(() => {
    setCurrentThread(null);
    setMessages([]);
    setError(null);
  }, []);

  const deleteThread = useCallback(async (threadId) => {
    try {
      await threadAPI.deleteThread(threadId);
      setThreads(prev => prev.filter(t => t.threadId !== threadId));
      if (currentThread?.threadId === threadId) {
        newChat();
      }
    } catch (err) {
      setError(err.message);
    }
  }, [currentThread, newChat]);

  const renameThread = useCallback(async (threadId, title) => {
    try {
      await threadAPI.renameThread(threadId, title);
      setThreads(prev =>
        prev.map(t => t.threadId === threadId ? { ...t, title } : t)
      );
      if (currentThread?.threadId === threadId) {
        setCurrentThread(prev => prev ? { ...prev, title } : prev);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [currentThread]);

  const clearError = useCallback(() => setError(null), []);

  const setExamplePrompt = useCallback((text) => {
    setPendingPrompt(text);
    setMode((prev) => {
      const modeMap = {
        "Explain quantum computing in simple terms": "general",
        "Write a Python function to sort a linked list": "coding",
        "Help me improve my resume summary": "resume",
        "Practice behavioral interview questions": "interview",
        "Teach me about neural networks step by step": "study",
      };
      return modeMap[text] || prev;
    });
  }, []);

  const consumePendingPrompt = useCallback(() => {
    const p = pendingPrompt;
    setPendingPrompt(null);
    return p;
  }, [pendingPrompt]);

  return (
    <ChatContext.Provider value={{
      threads,
      currentThread,
      messages,
      loading,
      awaitingReply,
      error,
      mode,
      setMode,
      fetchThreads,
      loadThread,
      sendMessage,
      newChat,
      deleteThread,
      renameThread,
      clearError,
      pendingPrompt,
      setExamplePrompt,
      consumePendingPrompt,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
