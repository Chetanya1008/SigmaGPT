import { useChat } from "../../context/ChatContext.jsx";
import "./ModeSelector.css";

const MODES = [
  { id: "general", label: "General", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { id: "coding", label: "Coding", icon: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
  { id: "resume", label: "Resume", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
  { id: "interview", label: "Interview", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
  { id: "study", label: "Study", icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" },
];

export default function ModeSelector() {
  const { mode, setMode } = useChat();

  return (
    <div className="mode-selector">
      {MODES.map((m) => (
        <button
          key={m.id}
          className={`mode-btn ${mode === m.id ? "mode-active" : ""}`}
          onClick={() => setMode(m.id)}
          title={m.label}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={m.icon}/>
          </svg>
          <span className="mode-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
