const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("sigmagpt_token");

  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const authAPI = {
  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request("/auth/me"),
};

export const chatAPI = {
  sendMessage: (threadId, message, mode = "general", attachments = []) => {
    if (attachments.length === 0) {
      return request("/chat", {
        method: "POST",
        body: JSON.stringify({ threadId, message, mode }),
      });
    }

    const formData = new FormData();
    formData.append("threadId", threadId);
    formData.append("message", message);
    formData.append("mode", mode);

    for (const file of attachments) {
      formData.append("attachments", file);
    }

    return request("/chat", {
      method: "POST",
      body: formData,
    });
  },
};

export const threadAPI = {
  getThreads: () => request("/threads"),

  getThread: (threadId) => request(`/threads/${threadId}`),

  renameThread: (threadId, title) =>
    request(`/threads/${threadId}`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    }),

  deleteThread: (threadId) =>
    request(`/threads/${threadId}`, {
      method: "DELETE",
    }),
};

export const resumeAPI = {
  analyze: (resumeText, jobDescription) =>
    request("/resume/analyze", {
      method: "POST",
      body: JSON.stringify({ resumeText, jobDescription }),
    }),
};
