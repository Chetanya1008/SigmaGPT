# SigmaGPT

A full-stack AI productivity platform built with React, Node.js, Express, MongoDB, and Google Gemini. Features persistent contextual conversations, multi-user authentication, specialized AI modes, and resume/job description analysis.

## Features

- **Contextual AI Conversations** - Full conversation history sent to Gemini so the AI understands previous context
- **Multi-User Authentication** - JWT-based auth with bcrypt password hashing; users only see their own conversations
- **5 AI Modes** - General Assistant, Coding Assistant, Resume Assistant, Interview Coach, Study Tutor
- **Resume / Job Description Analysis** - AI-powered match scoring, skills gap analysis, and ATS optimization tips
- **Persistent Threads** - Conversations saved to MongoDB and searchable across sessions
- **Code Syntax Highlighting** - Automatic code block detection with copy button
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Thread Management** - Create, rename, delete, and search conversations
- **File & Image Attachments** - Attach images, PDFs, and text files to conversations for multimodal AI analysis

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, React Router, React Markdown |
| Backend | Node.js, Express 5, ES Modules |
| Database | MongoDB, Mongoose |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Auth | JWT, bcryptjs |
| Security | Rate limiting, CORS, environment variables |

## Architecture

```
React (SPA)
    |
    v
Express REST API
    |
    +-- Controllers (auth, chat, thread, resume)
    +-- Services (geminiService)
    +-- Middleware (auth, error handling, rate limiting)
    +-- Models (User, Thread)
    |
    +-- MongoDB (data persistence)
    +-- Google Gemini API (AI responses)
```

## Screenshots

> Screenshots can be added here after running the application.

## Installation

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- Google Gemini API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/SigmaGPT.git
cd SigmaGPT
```

2. Install backend dependencies:
```bash
cd Backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../Frontend
npm install
```

4. Configure environment variables:
```bash
cd ../Backend
cp .env.example .env
# Edit .env with your values
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend:
```bash
cd Backend
npm run dev
```

7. Start the frontend (in a new terminal):
```bash
cd Frontend
npm run dev
```

8. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/SigmaGPT` |
| `GEMINI_API_KEY` | Google Gemini API key | `your_api_key_here` |
| `JWT_SECRET` | Secret for JWT signing | `any_long_random_string` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

### Frontend (`Frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080/api` |

> Never commit real credentials. `.env` files are included in `.gitignore`.

## API Overview

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user (protected) |

### Threads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/threads` | Get all threads for user (protected) |
| `GET` | `/api/threads/:threadId` | Get thread messages (protected) |
| `PUT` | `/api/threads/:threadId` | Rename a thread (protected) |
| `DELETE` | `/api/threads/:threadId` | Delete a thread (protected) |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message and get AI response (protected) |

### Resume Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/analyze` | Analyze resume against job description (protected) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

## AI Modes

| Mode | Description |
|------|-------------|
| **General** | Helpful, well-structured responses on any topic |
| **Coding** | Debugging, code review, best practices, programming concepts |
| **Resume** | ATS optimization, achievement quantification, professional wording |
| **Interview** | Technical/behavioral questions, mock interviews, STAR method |
| **Study** | Teaching concepts, quizzes, progressive difficulty, real-world examples |

## File & Image Attachments

SigmaGPT supports multimodal conversations where you can attach files and images and ask Gemini questions about them.

### Supported File Types

| Type | Extensions |
|------|-----------|
| Images | `.jpg`, `.jpeg`, `.png`, `.webp` |
| Documents | `.pdf`, `.txt` |

### Limits

- **Maximum file size:** 10 MB per file
- **Maximum attachments:** 5 per message

### Usage Examples

- Upload a screenshot and ask "What's causing this error?"
- Attach a PDF resume and ask "What skills should I improve?"
- Upload a diagram and ask "Explain this architecture"
- Attach a text file and ask "Summarize these notes"

### How It Works

1. Files are uploaded via the attachment button in the chat input
2. The backend validates file type, MIME type, and size
3. Images are sent to Gemini as inline base64 data for visual analysis
4. PDF and text file contents are processed and sent to Gemini
5. Only attachment metadata (name, type, size) is stored in MongoDB — not the actual file data
6. Temporary processing data is not persisted after the API response

## Project Structure

```
SigmaGPT/
├── Backend/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── threadController.js
│   │   └── resumeController.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   └── Thread.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── threadRoutes.js
│   │   └── resumeRoutes.js
│   ├── middleware/          # Auth, error handling, uploads
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   ├── services/           # Business logic
│   │   └── geminiService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Sidebar/
│   │   │   ├── ChatWindow/
│   │   │   ├── Message/
│   │   │   ├── ChatInput/
│   │   │   ├── CodeBlock/
│   │   │   ├── ProfileMenu/
│   │   │   ├── ModeSelector/
│   │   │   └── ResumeAnalyzer/
│   │   ├── pages/          # Route pages
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── context/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── services/       # API client
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Future Improvements

- Streaming AI responses for faster perceived performance
- Conversation export (PDF/Markdown)
- Voice input support
- DOCX file support
- Dark/light theme toggle
- Conversation sharing
- Usage analytics dashboard

## License

This project is for portfolio demonstration purposes.
