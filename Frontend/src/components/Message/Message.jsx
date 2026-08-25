import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "../CodeBlock/CodeBlock.jsx";
import "./Message.css";

function AttachmentBadge({ attachment }) {
  const isImage = attachment.type === "image";
  const icon = isImage ? "🖼" : attachment.mimeType === "application/pdf" ? "📄" : "📝";
  return (
    <span className="attachment-badge">
      <span className="attachment-badge-icon">{icon}</span>
      <span className="attachment-badge-name">{attachment.name}</span>
    </span>
  );
}

export default function Message({ message, isLatest, latestReply }) {
  const isUser = message.role === "user";
  const content = isLatest && latestReply ? latestReply : message.content;
  const hasAttachments = message.attachments?.length > 0;

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      {!isUser && (
        <div className="message-avatar">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#6366f1"/>
            <path d="M12 28V12l8 8 8-8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div className={`message-content ${isUser ? "message-content-user" : "message-content-assistant"}`}>
        {isUser && hasAttachments && (
          <div className="message-attachments">
            {message.attachments.map((att, i) => (
              <AttachmentBadge key={i} attachment={att} />
            ))}
          </div>
        )}
        {isUser ? (
          <p className="message-text">{content}</p>
        ) : (
          <div className="message-markdown">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children }) => {
                  const codeChild = children?.props?.children;
                  const className = children?.props?.className || "";
                  const match = /language-(\w+)/.exec(className);
                  const language = match ? match[1] : "";
                  return <CodeBlock language={language} code={typeof codeChild === "string" ? codeChild.replace(/\n$/, "") : ""} />;
                },
                code({ inline, className, children, ...rest }) {
                  if (inline) {
                    return <code className="inline-code" {...rest}>{children}</code>;
                  }
                  return <code className={className} {...rest}>{children}</code>;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
