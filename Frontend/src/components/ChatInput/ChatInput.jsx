import { useRef, useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext.jsx";
import "./ChatInput.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt"];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(mimeType) {
  if (mimeType?.startsWith("image/")) return "🖼";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType === "text/plain") return "📝";
  return "📎";
}

export default function ChatInput() {
  const { loading, sendMessage, currentThread, pendingPrompt, consumePendingPrompt } = useChat();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [previews, setPreviews] = useState({});
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, []);

  useEffect(() => {
    const prompt = consumePendingPrompt();
    if (prompt && textareaRef.current) {
      textareaRef.current.value = prompt;
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [pendingPrompt, consumePendingPrompt]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const validateFile = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type: ${ext}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File exceeds the 10 MB limit (${formatSize(file.size)})`;
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFileError("");

    if (attachments.length + selected.length > MAX_FILES) {
      setFileError(`You can attach up to ${MAX_FILES} files.`);
      e.target.value = "";
      return;
    }

    const validFiles = [];
    for (const file of selected) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length) {
      setAttachments((prev) => [...prev, ...validFiles]);

      for (const file of validFiles) {
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setPreviews((prev) => ({ ...prev, [file.name + file.size]: url }));
        }
      }
    }

    e.target.value = "";
  };

  const removeAttachment = (index) => {
    const file = attachments[index];
    const key = file.name + file.size;
    if (previews[key]) {
      URL.revokeObjectURL(previews[key]);
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const handleSubmit = async () => {
    const textarea = textareaRef.current;
    const message = textarea?.value?.trim();
    if ((!message && !attachments.length) || loading) return;

    const threadId = currentThread?.threadId || crypto.randomUUID();
    const currentAttachments = [...attachments];
    textarea.value = "";
    textarea.style.height = "auto";
    setAttachments([]);
    setPreviews({});
    setFileError("");

    try {
      await sendMessage(threadId, message || "Please analyze the attached files.", currentAttachments);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("chat-input-dragover");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("chat-input-dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("chat-input-dragover");
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length) {
      const fakeEvent = { target: { files: droppedFiles, value: "" } };
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="chat-input-wrapper">
      {fileError && (
        <div className="chat-attachment-error">
          <span>{fileError}</span>
          <button onClick={() => setFileError("")}>✕</button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="chat-attachments-preview">
          {attachments.map((file, idx) => {
            const key = file.name + file.size;
            const isImage = file.type.startsWith("image/");
            return (
              <div key={key} className="attachment-card">
                {isImage && previews[key] ? (
                  <div className="attachment-thumb">
                    <img src={previews[key]} alt={file.name} />
                  </div>
                ) : (
                  <div className="attachment-icon">{getFileIcon(file.type)}</div>
                )}
                <div className="attachment-info">
                  <span className="attachment-name">{file.name}</span>
                  <span className="attachment-size">{formatSize(file.size)}</span>
                </div>
                <button
                  className="attachment-remove"
                  onClick={() => removeAttachment(idx)}
                  aria-label={`Remove ${file.name}`}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        className="chat-input-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="chat-file-input"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
          multiple
          onChange={handleFileSelect}
          aria-label="Attach files"
        />
        <button
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Attach files (images, PDF, TXT)"
          aria-label="Attach files"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder={attachments.length ? "Ask something about these files..." : "Message SigmaGPT..."}
          rows={1}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className={`send-btn ${loading ? "send-btn-disabled" : ""}`}
          onClick={handleSubmit}
          disabled={loading}
          title="Send message"
        >
          {loading ? (
            <div className="send-spinner">
              <div className="spinner-dot"></div>
              <div className="spinner-dot"></div>
              <div className="spinner-dot"></div>
            </div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          )}
        </button>
      </div>
      <p className="chat-input-disclaimer">
        SigmaGPT can make mistakes. Check important information.
      </p>
    </div>
  );
}
