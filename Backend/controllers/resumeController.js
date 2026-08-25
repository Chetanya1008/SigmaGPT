import { analyzeResume } from "../services/geminiService.js";

const analyze = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({ error: "Both resume text and job description are required" });
    }

    if (resumeText.length > 50000 || jobDescription.length > 50000) {
      return res.status(400).json({ error: "Input text is too long (max 50,000 characters each)" });
    }

    const analysis = await analyzeResume(resumeText, jobDescription);
    res.json({ analysis });
  } catch (err) {
    console.error("Resume analysis error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze resume" });
  }
};

export { analyze };
