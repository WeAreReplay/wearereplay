import { useState, useEffect } from "react";
import "../assets/css/dashboard.css";
import "../assets/css/contact-attachments.css";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaEye, FaList } from "react-icons/fa";
import { MdReport, MdMessage } from "react-icons/md";
import { RiSendPlaneFill } from "react-icons/ri";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";
import AdminReview from "../components/AdminReview";
import Overlay from "../components/Overlay";
import Toast from "../components/Toast";
import GetPlatformIcon from "../components/GetPlatformIcon";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// TODO: Replace approval listings and reported users data and connect to backend API (reported users, approval listings)

// ! ---------------- HELPERS ----------------

const ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  VIEW: "view",
};

const CONFIRM_CONFIG = {
  [ACTIONS.APPROVE]: {
    title: "Approve Listing",
    message: "Are you sure you want to approve this listing?",
    confirmText: "Approve",
  },
  [ACTIONS.REJECT]: {
    title: "Reject Listing",
    message: "Are you sure you want to reject this listing?",
    confirmText: "Reject",
  },
};

const getValue = (obj, path) => {
  const value = path.split(".").reduce((acc, key) => acc?.[key], obj);

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
};

// ! ---------------- COLUMNS CONFIG ----------------

const COLS = {
  text: (label, key) => ({ label, key }),
  image: { label: "Image", key: "image", isImage: true },
  platform: { label: "Platform", key: "platform", isIcon: true },
  actions: { label: "Actions", key: "actions", isActions: true },
};

export default function Admin() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({
    type: null,
    data: null,
  });
  const [activeTab, setActiveTab] = useState("approvals");

  // Messaging state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAnyModalOpen = modal.type !== null;

  const tabs = [
    { key: "approvals", icon: FaList, label: "Listing Approvals" },
    { key: "reports", icon: MdReport, label: "User Reports" },
    { key: "messages", icon: MdMessage, label: "Messages" },
  ];

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Fetch conversations when messages tab is active
  useEffect(() => {
    if (activeTab === "messages" && token) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [activeTab, token]);

  // ! ---------------- MESSAGING HANDLERS ----------------

  const fetchConversations = async () => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("📨 Conversations API response:", data);

      if (data.success) {
        setConversations(data.data.conversations);
        console.log("✅ Loaded conversations:", data.data.conversations.length);
      } else {
        console.error("❌ Failed to load conversations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchConversationMessages = async (userId) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSelectedMessages(data.data.messages);
        setSelectedConversation(data.data.user);
        // Refresh unread count after viewing
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`${API_URL}/messages/admin-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyText,
          userId: selectedConversation._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReplyText("");
        // Add new message to the list
        setSelectedMessages((prev) => [...prev, data.data.message]);
        // Refresh conversations list
        fetchConversations();
        setToast({
          color: "green",
          icon: "check",
          message: "Reply sent successfully!",
        });
      } else {
        throw new Error(data.message || "Failed to send reply");
      }
    } catch (err) {
      console.error("Send reply error:", err);
      setToast({
        color: "red",
        icon: "error",
        message: err.message || "Failed to send reply",
      });
    }
  };

  const handleCloseConversation = () => {
    setSelectedConversation(null);
    setSelectedMessages([]);
    setReplyText("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ! ---------------- LISTING HANDLERS ----------------

  const handleViewListing = (listing) => {
    setModal({
      type: "approval",
      data: listing,
    });
  };

  const handleApprove = () => {
    setApprovalListings((prev) =>
      prev.filter((item) => item.id !== modal.data.id),
    );

    setToast({
      color: "green",
      icon: "check",
      title: modal.data.submittedBy.name,
      message: "approved successfully!",
    });

    handleCloseModal();
  };

  const handleReject = () => {
    setApprovalListings((prev) =>
      prev.filter((item) => item.id !== modal.data.id),
    );

    setToast({
      color: "red",
      icon: "trash",
      title: modal.data.submittedBy.name,
      message: "was rejected!",
    });

    handleCloseModal();
  };

  // ! ---------------- REPORT HANDLERS ----------------

  const handleViewReport = (report) => {
    setModal({
      type: "report",
      data: report,
    });
  };

  const handleCancelReport = () => {
    setReportedUsers((prev) => prev.filter((r) => r.id !== modal.data.id));

    setToast({
      color: "blue",
      icon: "info",
      title: modal.data.reportedUser.name,
      message: "report canceled!",
    });

    handleCloseModal();
  };

  const handleFreeze = () => {
    setReportedUsers((prev) => prev.filter((r) => r.id !== modal.data.id));

    setToast({
      color: "yellow",
      icon: "freeze",
      title: modal.data.reportedUser.name,
      message: "report removed!",
    });

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setModal({
      type: null,
      data: null,
    });
  };

  /*
    ! Pending Listings (for approval)
  */
  const [approvalListings, setApprovalListings] = useState([
    {
      id: 101,
      name: "Red Dead Redemption 2",
      platform: "PlayStation",
      consoleModel: "PS5",
      price: 130,
      genre: "Action",
      tag: "Open World",
      status: "Pending",
      about: "Excellent condition disc, original case included.",
      borrowDuration: 180,
      hasExpansions: "no",
      deliveryMethod: "Meet-Up",
      image: hogwarts,
      submittedBy: {
        name: "PlayerOne",
        email: "player@replay.com",
      },
      submittedOn: "2026-04-15",
    },
    {
      id: 102,
      name: "Cyberpunk 2077",
      platform: "Xbox",
      consoleModel: "Xbox Series X",
      price: 90,
      genre: "RPG",
      tag: "Futuristic",
      status: "Pending",
      about: "Updated version with DLC expansion.",
      borrowDuration: 90,
      hasExpansions: "yes",
      deliveryMethod: "Drop-off",
      image: pokemon,
      submittedBy: {
        name: "PlayerThirty",
        email: "player@third.com",
      },
      submittedOn: "2026-04-16",
    },
    {
      id: 103,
      name: "Animal Crossing: New Horizons",
      platform: "Nintendo",
      consoleModel: "Switch",
      price: 70,
      genre: "Simulation",
      tag: "Relaxing",
      status: "Pending",
      about: "Lightly used cartridge in perfect condition.",
      borrowDuration: 60,
      hasExpansions: "yes",
      deliveryMethod: "Pick-up",
      image: donkeyKong,
      submittedBy: {
        name: "PlayerFive",
        email: "player@five.com",
      },
      submittedOn: "2026-04-17",
    },
  ]);

  /*
    ! Reported Users
  */
  const [reportedUsers, setReportedUsers] = useState([
    {
      id: 1,
      reportedBy: {
        name: "PlayerA",
        email: "playerA@email.com",
      },
      reportedUser: {
        name: "PlayerX",
        email: "playerX@email.com",
      },
      category: "Game Return Issue",
      reason: "Did not return game",
      submittedOn: "2026-04-18",
    },

    {
      id: 2,
      reportedBy: {
        name: "PlayerB",
        email: "playerB@email.com",
      },
      reportedUser: {
        name: "ToxicPlayer",
        email: "toxic@email.com",
      },
      category: "Abusive Behavior",
      reason: "Abusive behavior in chat",
      submittedOn: "2026-04-19",
    },
  ]);

  /*
    ! Dashboard Table Configuration
    * Controls how tables are rendered dynamically
  */
  const ADMIN_TABLES = [
    {
      section: "approvals",
      title: "Listing Approvals",
      data: approvalListings,
      columns: [
        COLS.text("Submitted On", "submittedOn"),
        COLS.text("User Name", "submittedBy.name"),
        COLS.text("User Email", "submittedBy.email"),
        COLS.text("Game", "name"),
        COLS.text("Platform", "platform"),
        COLS.text("Console Model", "consoleModel"),
        COLS.text("Price (AED)", "price"),
        COLS.image,
        COLS.text("About", "about"),
        COLS.text("Genre", "genre"),
        COLS.text("Tag", "tag"),
        COLS.text("Expansions", "hasExpansions"),
        COLS.text("Delivery", "deliveryMethod"),
        COLS.text("Borrow Duration (Days)", "borrowDuration"),
        COLS.actions,
      ],
    },
    {
      section: "reports",
      title: "Reported Users",
      data: reportedUsers,
      columns: [
        COLS.text("Submitted On", "submittedOn"),
        COLS.text("Reported By (Name)", "reportedBy.name"),
        COLS.text("Reported By (Email)", "reportedBy.email"),
        COLS.text("Reported User (Name)", "reportedUser.name"),
        COLS.text("Reported User (Email)", "reportedUser.email"),
        COLS.text("Category", "category"),
        COLS.text("Reason", "reason"),
        COLS.actions,
      ],
    },
  ];

  /*
    ! Review Layout Configuration
    * Controls how the review layout are rendered dynamically
  */
  const approvalReviewLayout = (listing) => [
    {
      title: "Game Info",
      items: [
        { label: "Game", value: listing.name },
        {
          label: "Platform",
          value: <GetPlatformIcon platform={listing.platform} />,
        },
        { label: "Console Model", value: listing.consoleModel },
        { label: "Price", value: `${listing.price} AED` },
        { label: "Genre", value: listing.genre },
        { label: "Tag", value: listing.tag },
        { label: "About", value: listing.about, isDescription: true },
      ],
    },
    {
      title: "Rental Info",
      items: [
        { label: "Borrow Duration", value: `${listing.borrowDuration} days` },
        { label: "Delivery Method", value: listing.deliveryMethod },
        { label: "Expansions", value: listing.hasExpansions },
      ],
    },
    {
      title: "Submission Info",
      items: [
        { label: "Submitted By", value: listing.submittedBy?.name },
        { label: "Email", value: listing.submittedBy?.email },
        { label: "Submitted On", value: listing.submittedOn, isDate: true },
      ],
    },
  ];

  const reportReviewLayout = (report) => [
    {
      title: "Report Info",
      items: [
        { label: "Submitted On", value: report.submittedOn, isDate: true },
        { label: "Category", value: report.category },
        { label: "Reason", value: report.reason, isDescription: true },
      ],
    },
    {
      title: "Reported By",
      items: [
        { label: "Name", value: report.reportedBy?.name },
        { label: "Email", value: report.reportedBy?.email },
      ],
    },
    {
      title: "Reported User",
      items: [
        { label: "Name", value: report.reportedUser?.name },
        { label: "Email", value: report.reportedUser?.email },
      ],
    },
  ];

  return (
    <>
      <DashboardHeader
        userName={user?.firstName || "Admin"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />
      <main className="dashboard-main">
        {ADMIN_TABLES.filter((t) => t.section === activeTab).map((table, i) => (
          <section className="dashboard-content" key={i}>
            <div className="title">
              <h2>{table.title}</h2>
            </div>
            <div className="table-wrapper">
              <div className="dashboard-table">
                <ul className="table-head">
                  <li>
                    {table.columns.map((col, k) => (
                      <span key={k}>{col.label}</span>
                    ))}
                  </li>
                </ul>
                <ul className="table-content">
                  {table.data.map((row, rowIndex) => (
                    <li key={rowIndex}>
                      {table.columns.map((col, colIndex) => {
                        {
                          // ! IMAGES
                        }
                        if (col.isImage) {
                          return (
                            <span key={colIndex}>
                              <img
                                src={row[col.key]}
                                alt={row.name}
                                className="table-image"
                              />
                            </span>
                          );
                        }

                        {
                          // ! ACTIONS
                        }
                        if (col.isActions) {
                          /*
                              ! Approval Actions
                            */
                          if (table.section === "approvals") {
                            return (
                              <span key={colIndex} className="actions">
                                <button
                                  className="icon-btn view"
                                  onClick={() => handleViewListing(row)}
                                >
                                  <FaEye /> View
                                </button>
                              </span>
                            );
                          }

                          /*
                              ! Report Actions
                            */
                          if (table.section === "reports") {
                            return (
                              <span key={colIndex} className="actions">
                                <button
                                  className="icon-btn view"
                                  onClick={() => handleViewReport(row)}
                                >
                                  <FaEye /> View
                                </button>
                              </span>
                            );
                          }
                        }

                        return (
                          <span key={colIndex}>
                            {getValue(row, col.key) || "—"}
                          </span>
                        );
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* Messages Section */}
        {activeTab === "messages" && (
          <section className="dashboard-content messages-section">
            <div className="title">
              <h2>
                User Messages
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount} unread</span>
                )}
              </h2>
            </div>

            <div className="messages-container">
              {/* Conversations List */}
              <div className="conversations-list">
                {messagesLoading && conversations.length === 0 ? (
                  <p className="loading-text">Loading conversations...</p>
                ) : conversations.length === 0 ? (
                  <p className="empty-text">No messages yet</p>
                ) : (
                  conversations.map((conv) => (
                    conv.user && (
                    <div
                      key={conv.conversationId}
                      className={`conversation-item ${
                        selectedConversation?._id === conv.user._id
                          ? "active"
                          : ""
                      } ${conv.unreadCount > 0 ? "unread" : ""}`}
                      onClick={() => fetchConversationMessages(conv.user._id)}
                    >
                      <div className="conversation-info">
                        <h4>
                          {conv.user.firstName} {conv.user.lastName}
                        </h4>
                        <p className="preview">
                          {conv.lastMessage.content.substring(0, 50)}
                          {conv.lastMessage.content.length > 50 ? "..." : ""}
                        </p>
                        <span className="timestamp">
                          {formatDate(conv.lastMessage.createdAt)}
                        </span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="unread-dot">{conv.unreadCount}</span>
                      )}
                    </div>
                  )
                  ))
                )}
              </div>

              {/* Selected Conversation */}
              {selectedConversation && (
                <div className="conversation-view">
                  <div className="conversation-header">
                    <h3>
                      {selectedConversation.firstName}{" "}
                      {selectedConversation.lastName}
                    </h3>
                    <button
                      className="close-btn"
                      onClick={handleCloseConversation}
                    >
                      ×
                    </button>
                  </div>

                  <div className="messages-list-admin">
                    {messagesLoading ? (
                      <p className="loading-text">Loading messages...</p>
                    ) : selectedMessages.length === 0 ? (
                      <p className="empty-text">No messages in this conversation</p>
                    ) : (
                      selectedMessages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`message ${
                            msg.sender.role === "admin" ? "admin" : "user"
                          }`}
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
                      ))
                    )}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="reply-form">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      maxLength={5000}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="send-btn"
                    >
                      <RiSendPlaneFill />
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        )}

        <Overlay isModalOpen={isAnyModalOpen} onClick={handleCloseModal} />

        {modal.type === "approval" && (
          <AdminReview
            title="Review Listing"
            image={modal.data.image}
            sections={approvalReviewLayout(modal.data)}
            onClose={handleCloseModal}
            secondaryAction={{
              label: "Reject",
              onClick: handleReject,
            }}
            primaryAction={{
              label: "Approve",
              onClick: handleApprove,
            }}
          />
        )}

        {modal.type === "report" && (
          <AdminReview
            title="Review Report"
            sections={reportReviewLayout(modal.data)}
            onClose={handleCloseModal}
            secondaryAction={{
              label: "Cancel Report",
              onClick: handleCancelReport,
            }}
            primaryAction={{
              label: "Freeze User",
              onClick: handleFreeze,
            }}
          />
        )}
      </main>
      <Toast
        color={toast?.color}
        icon={toast?.icon}
        title={toast?.title}
        message={toast?.message}
        isVisible={!!toast}
      />
    </>
  );
}
