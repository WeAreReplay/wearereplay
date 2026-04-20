import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiHome7Fill, RiSendPlaneFill, RiMailFill, RiMessage3Fill } from "react-icons/ri";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";
import InputField from "../components/InputField";
import "../assets/css/contact.css";

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

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim() || loading) return;

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
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formData.message,
          // receiverId is optional - backend will auto-find an admin
        }),
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

      // Reset message field
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));

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
                    <p>{msg.content}</p>
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
                required
              />
              <span className="char-count">
                {formData.message.length}/5000
              </span>
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
              disabled={!formData.message.trim() || loading}
              className="send-btn"
            >
              <RiSendPlaneFill className="icon" />
              <span>{loading ? "Sending..." : "Send Message"}</span>
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
