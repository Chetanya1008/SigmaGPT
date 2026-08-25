import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODE_SYSTEM_PROMPTS = {
  general: `You are SigmaGPT, a helpful and knowledgeable AI assistant. Provide clear, accurate, and well-structured responses. Be conversational yet professional. When appropriate, use markdown formatting for better readability including headers, lists, bold text, and code blocks.`,
  coding: `You are SigmaGPT Coding Assistant, an expert software engineer and programming mentor. You help with:
- Writing clean, efficient, and maintainable code
- Debugging and troubleshooting code issues
- Explaining programming concepts clearly
- Reviewing code and suggesting improvements
- Following best practices and design patterns

Always provide well-formatted code with proper syntax highlighting. Explain your reasoning and approach. When suggesting code, prefer modern practices and clean architecture.`,
  resume: `You are SigmaGPT Resume Assistant, a professional career advisor specializing in resume optimization. You help with:
- ATS-friendly resume formatting and content
- Quantifying achievements with metrics
- Tailoring resumes to specific job descriptions
- Professional summary and objective writing
- Skills optimization and keyword alignment
- Identifying strengths and areas for improvement

Provide actionable, specific advice. When analyzing resumes, give honest feedback with clear improvement suggestions. Use professional language and industry best practices.`,
  interview: `You are SigmaGPT Interview Coach, an experienced interview preparation specialist. You help with:
- Technical interview questions and answers
- Behavioral interview preparation (STAR method)
- System design interview practice
- Mock interview simulations
- Answer structure and delivery
- Salary negotiation tips

Provide detailed, well-structured answers. When conducting mock interviews, ask follow-up questions and provide constructive feedback. Focus on both technical accuracy and communication skills.`,
  study: `You are SigmaGPT Study Tutor, a patient and effective learning companion. You help with:
- Breaking down complex topics into understandable parts
- Providing real-world examples and analogies
- Creating study plans and schedules
- Quiz generation and practice problems
- Connecting concepts across subjects
- Building deep understanding vs. rote memorization

Use progressive difficulty. Start with fundamentals and build up. Encourage active learning through questions and exercises. Adapt explanations to the learner's level.`,
};

function buildGeminiContents(messages) {
  return messages.map((msg) => {
    const parts = [];

    if (msg.attachments?.length) {
      for (const att of msg.attachments) {
        if (att._fileBuffer && att.mimeType) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att._fileBuffer.toString("base64"),
            },
          });
        }
      }
    }

    if (msg.content?.trim()) {
      parts.push({
        text: msg.content,
      });
    }

    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts,
    };
  });
}

const getGeminiResponse = async (messages, mode = "general") => {
  try {
    const contents = buildGeminiContents(messages);
    const systemInstruction = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.general;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (err) {
    console.error("Gemini API Error:", err.message);

    if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("invalid api key")) {
      throw new Error("Invalid Gemini API key. Please check your configuration.");
    }
    if (err.message?.includes("QUOTA_EXCEEDED") || err.message?.includes("quota")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    }
    if (err.message?.includes("SAFETY") || err.message?.includes("blocked")) {
      throw new Error("The response was blocked by safety filters. Please rephrase your message.");
    }

    throw new Error("Failed to generate AI response. Please try again.");
  }
};

const generateThreadTitle = async (firstMessage) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `Generate a short, concise title (max 5 words) for this conversation starter. Do not use quotes or punctuation. Just return the title text:\n\n"${firstMessage}"`,
          }],
        },
      ],
    });

    const title = response.text?.trim().replace(/^["']|["']$/g, "").slice(0, 50);
    return title || "New Chat";
  } catch {
    return "New Chat";
  }
};

const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `You are an expert ATS and resume analyzer. Analyze the following resume against the job description and provide a comprehensive analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis in the following format using markdown:

## Match Score: [X]/100

## Skills Found
List the skills from the resume that match the job requirements.
- ...

## Missing Skills
List important skills from the job description not found in the resume.
- ...

## Recommended Improvements
Provide specific, actionable suggestions to improve the resume for this role.
1. ...
2. ...

## ATS Optimization Tips
Provide suggestions to improve ATS compatibility.
- ...

## Potential Interview Questions
Based on the job description and resume, suggest likely interview questions.
1. ...
2. ...

Be honest and specific. The score should reflect actual alignment between the resume and job description.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text;
  } catch (err) {
    console.error("Resume analysis error:", err.message);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};

export { getGeminiResponse, generateThreadTitle, analyzeResume };
