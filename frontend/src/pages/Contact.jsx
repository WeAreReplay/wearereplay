import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiHome7Fill, RiSendPlaneFill, RiMailFill, RiMessage3Fill, RiAttachmentLine, RiCloseLine, RiImageLine } from "react-icons/ri";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";
import InputField from "../components/InputField";
import "../assets/css/contact.css";
import "../assets/css/contact-attachments.css";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Contact() {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasConversation, setHasConversation] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated() && user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }));
      // Check if user has existing conversation
      fetchConversation();
    }
  }, [isAuthenticated, user]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch user's conversation with admin
  const fetchConversation = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/messages/my-conversation`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.messages.length > 0) {
        setHasConversation(true);
        setConversation(data.data.messages);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 3) {
      setToast({
        color: "red",
        icon: "error",
        message: "Maximum 3 files allowed per message.",
      });
      return;
    }

    // Validate file size (5MB max)
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          color: "red",
          icon: "error",
          message: `${file.name} is too large. Maximum file size is 5MB.`,
        });
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Check if file is an image
  const isImage = (file) => file.type.startsWith("image/");

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Allow message with content or attachments
    const hasContent = formData.message.trim().length > 0;
    const hasAttachments = attachments.length > 0;

    if ((!hasContent && !hasAttachments) || loading) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      setToast({
        color: "red",
        icon: "error",
        message: "Please log in to send a message.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append("content", formData.message);

      // Add attachments
      attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setToast({
        color: "green",
        icon: "check",
        message: "Message sent successfully! We'll get back to you soon.",
      });

      // Reset form
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));
      setAttachments([]);

      // Refresh conversation
      fetchConversation();
    } catch (err) {
      console.error("Send message error:", err);
      setToast({
        color: "red",
        icon: "error",
        message: err.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for messages
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="contact-main">
      <div className="contact-ctr">
        {/* Header */}
        <div className="contact-header">
          <h1>
            <RiMailFill className="icon" />
            Contact Us
          </h1>
          <p>Have a question or feedback? Send us a message!</p>
        </div>

        {/* Conversation History */}
        {hasConversation && conversation.length > 0 && (
          <div className="conversation-section">
            <h2>
              <RiMessage3Fill className="icon" />
              Your Conversation
            </h2>
            <div className="messages-list">
              {conversation.map((msg) => (
                <div
                  key={msg._id}
                  className={`message ${msg.sender.role === "admin" ? "admin" : "user"}`}
                >
                  <div className="message-content">
                    {msg.content && <p>{msg.content}</p>}
                    {/* Display Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="message-attachments">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx} className="attachment-item">
                            {att.mimeType?.startsWith("image/") ? (
                              <a
                                href={`${API_URL.replace("/api", "")}${att.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-image"
                              >
                                <img
                                  src={`${API_URL.replace("/api", "")}${att.url}`}
                                  alt={att.filename}
                                  loading="lazy"
                                />
                              </a>
                            ) : (
                              <a
                                href={`${API_URL.replace("/api", "")}${att.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-file"
                              >
                                <span className="file-icon">📄</span>
                                <span className="file-name">{att.filename}</span>
                                <span className="file-size">
                                  {(att.size / 1024).toFixed(1)} KB
                                </span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="message-meta">
                      {msg.sender.firstName} • {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="contact-form">
          <ul className="fields-ctr">
            {/* Name Field */}
            <li className="field-item">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                readOnly={isAuthenticated()}
                className={isAuthenticated() ? "readonly" : ""}
              />
            </li>

            {/* Email Field */}
            <li className="field-item">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                readOnly={isAuthenticated()}
                className={isAuthenticated() ? "readonly" : ""}
              />
            </li>

            {/* Message Field */}
            <li className="field-item textarea-item">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                rows={5}
                maxLength={5000}
              />
              <span className="char-count">
                {formData.message.length}/5000
              </span>
            </li>

            {/* Attachments Field */}
            <li className="field-item attachments-item">
              <label>Attachments (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 3}
              >
                <RiAttachmentLine className="icon" />
                <span>Add Files ({attachments.length}/3)</span>
              </button>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="attachment-previews">
                  {attachments.map((file, index) => (
                    <div key={index} className="attachment-preview">
                      {isImage(file) ? (
                        <div className="preview-image">
                          <RiImageLine className="icon" />
                          <span className="filename">{file.name}</span>
                        </div>
                      ) : (
                        <div className="preview-file">
                          <span className="filename">{file.name}</span>
                          <span className="filesize">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeAttachment(index)}
                      >
                        <RiCloseLine />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </li>
          </ul>

          <Toast
            color={toast?.color}
            icon={toast?.icon}
            message={toast?.message}
            isVisible={!!toast}
          />

          {/* Buttons */}
          <div className="form-actions">
            <Link to="/" className="home-link">
              <RiHome7Fill className="icon" />
              <span>Back to Home</span>
            </Link>

            <button
              type="submit"
              disabled={
                (!formData.message.trim() && attachments.length === 0) ||
                loading
              }
              className="send-btn"
            >
              <RiSendPlaneFill className="icon" />
              <span>
                {loading ? "Sending..." : attachments.length > 0
                  ? `Send Message (${attachments.length} file${attachments.length > 1 ? "s" : ""})`
                  : "Send Message"}
              </span>
            </button>
          </div>
        </form>

        {/* Not logged in notice */}
        {!isAuthenticated() && (
          <div className="auth-notice">
            <p>
              <Link to="/login">Log in</Link> or{" "}
              <Link to="/register">register</Link> to send messages and track
              your conversations.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
