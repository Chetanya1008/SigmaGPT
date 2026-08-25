import { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext.jsx";
import Message from "../Message/Message.jsx";
import ChatInput from "../ChatInput/ChatInput.jsx";
import ModeSelector from "../ModeSelector/ModeSelector.jsx";
import ResumeAnalyzer from "../ResumeAnalyzer/ResumeAnalyzer.jsx";
import ProfileMenu from "../ProfileMenu/ProfileMenu.jsx";
import "./ChatWindow.css";

const EXAMPLE_PROMPTS = [
  { text: "Explain quantum computing in simple terms", mode: "general" },
  { text: "Write a Python function to sort a linked list", mode: "coding" },
  { text: "Help me improve my resume summary", mode: "resume" },
  { text: "Practice behavioral interview questions", mode: "interview" },
  { text: "Teach me about neural networks step by step", mode: "study" },
];

export default function ChatWindow({ onMenuClick }) {
  const { messages, loading, awaitingReply, error, currentThread, mode, clearError, setExamplePrompt } = useChat();
  const [profileOpen, setProfileOpen] = useState(false);
  const [latestReply, setLatestReply] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, latestReply]);

  useEffect(() => {
    if (loading || !lastMessage || lastMessage.role !== "assistant") {
      setLatestReply(null);
      return;
    }

    const content = lastMessage.content.split(" ");
    let idx = 0;

    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));
      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [loading, lastMessage]);

  useEffect(() => {
    setLatestReply(null);
  }, [currentThread?.threadId]);

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className="chat-window">
      <div className="chat-topbar">
        <button className="menu-btn" onClick={onMenuClick}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="topbar-title">SigmaGPT</span>
        <div className="topbar-right">
          <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
        <ProfileMenu isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>

      <div className="chat-content" ref={containerRef}>
        {showWelcome ? (
          <div className="welcome-screen">
            <div className="welcome-brand">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#6366f1"/>
                <path d="M12 28V12l8 8 8-8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="welcome-title">How can I help you today?</h1>
            <p className="welcome-subtitle">Choose a mode below and start a conversation</p>

            <ModeSelector />

            <div className="welcome-examples">
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="example-prompt"
                  onClick={() => setExamplePrompt(prompt.text)}
                >
                  {prompt.text}
                </button>
              ))}
            </div>

            {mode === "resume" && (
              <div className="welcome-resume-cta">
                <ResumeAnalyzer />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="messages-container">
              {messages.map((msg, idx) => {
                const isLatestAssistant = idx === messages.length - 1 && msg.role === "assistant" && latestReply;
                return (
                  <Message
                    key={idx}
                    message={msg}
                    isLatest={isLatestAssistant}
                    latestReply={latestReply}
                  />
                );
              })}

              {awaitingReply && (
                <div className="message message-assistant">
                  <div className="message-avatar">
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="10" fill="#6366f1"/>
                      <path d="M12 28V12l8 8 8-8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="chat-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{error}</span>
                  <button onClick={clearError}>Dismiss</button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      <ChatInput />
    </div>
  );
}
