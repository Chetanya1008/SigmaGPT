import { useState } from "react";
import { resumeAPI } from "../../services/api.js";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "./ResumeAnalyzer.css";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both resume text and job description");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const data = await resumeAPI.analyze(resumeText, jobDescription);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-analyzer">
      <div className="resume-header">
        <div className="resume-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <h2>Resume / Job Description Analyzer</h2>
        <p>Paste your resume and a job description to get AI-powered matching analysis</p>
      </div>

      <div className="resume-inputs">
        <div className="resume-input-group">
          <label>Resume / CV</label>
          <textarea
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
          />
        </div>
        <div className="resume-input-group">
          <label>Job Description</label>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
          />
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={loading || !resumeText.trim() || !jobDescription.trim()}
      >
        {loading ? "Analyzing..." : "Analyze Match"}
      </button>

      {error && <div className="resume-error">{error}</div>}

      {analysis && (
        <div className="resume-result">
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
            {analysis}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
