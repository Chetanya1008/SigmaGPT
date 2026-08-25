import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  const { threads, currentThread, fetchThreads, loadThread, deleteThread, renameThread, newChat } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleNewChat = () => {
    newChat();
    onClose?.();
  };

  const handleThreadClick = async (threadId) => {
    await loadThread(threadId);
    onClose?.();
  };

  const handleDelete = async (e, threadId) => {
    e.stopPropagation();
    await deleteThread(threadId);
  };

  const startRename = (e, thread) => {
    e.stopPropagation();
    setRenamingId(thread.threadId);
    setRenameValue(thread.title);
  };

  const handleRenameSubmit = async (threadId) => {
    if (renameValue.trim()) {
      await renameThread(threadId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredThreads = threads.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedThreads = groupByDate(filteredThreads);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#6366f1"/>
              <path d="M12 28V12l8 8 8-8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="brand-name">SigmaGPT</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Chat
        </button>

        <div className="sidebar-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-threads">
          {Object.entries(groupedThreads).map(([dateLabel, threadList]) => (
            <div key={dateLabel} className="thread-group">
              <div className="thread-group-label">{dateLabel}</div>
              {threadList.map((thread) => (
                <div
                  key={thread.threadId}
                  className={`thread-item ${thread.threadId === currentThread?.threadId ? "thread-active" : ""}`}
                  onClick={() => handleThreadClick(thread.threadId)}
                >
                  {renamingId === thread.threadId ? (
                    <input
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(thread.threadId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(thread.threadId);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="thread-title">{thread.title || "New Chat"}</span>
                      <div className="thread-actions">
                        <button
                          className="thread-action-btn"
                          onClick={(e) => startRename(e, thread)}
                          title="Rename"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="thread-action-btn thread-delete"
                          onClick={(e) => handleDelete(e, thread.threadId)}
                          title="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
          {filteredThreads.length === 0 && (
            <div className="sidebar-empty">
              {search ? "No matching conversations" : "No conversations yet"}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-email">{user?.email || ""}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

function groupByDate(threads) {
  const groups = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86400000);
  const weekAgo = new Date(today - 7 * 86400000);

  for (const thread of threads) {
    const date = new Date(thread.updatedAt || thread.createdAt);
    let label;

    if (date >= today) label = "Today";
    else if (date >= yesterday) label = "Yesterday";
    else if (date >= weekAgo) label = "Previous 7 days";
    else label = "Older";

    if (!groups[label]) groups[label] = [];
    groups[label].push(thread);
  }

  return groups;
}
