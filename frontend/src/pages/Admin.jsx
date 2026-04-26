import { useState, useEffect } from "react";
import "../assets/css/dashboard.css";
import "../assets/css/contact-attachments.css";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaList,
  FaStar,
  FaRegStar,
  FaUsers,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { MdReport, MdMessage } from "react-icons/md";
import { RiSendPlaneFill } from "react-icons/ri";
import AdminReview from "../components/AdminReview";
import Overlay from "../components/Overlay";
import Toast from "../components/Toast";
import GetPlatformIcon from "../components/GetPlatformIcon";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  status: { label: "Status", key: "status", isStatus: true },
  date: (label, key) => ({ label, key, isDate: true }),
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
  const [rejectionReason, setRejectionReason] = useState("");

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
    { key: "all-listings", icon: FaEye, label: "All Listings" },
    { key: "reports", icon: MdReport, label: "User Reports" },
    { key: "messages", icon: MdMessage, label: "Messages" },
    { key: "users", icon: FaUsers, label: "User Management" },
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

  // User Management State
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMetricsForm, setUserMetricsForm] = useState({
    damageReports: 0,
    successfulReturns: 0,
    lateReturns: 0,
    lends: 0,
    borrows: 0,
    completionRate: 0,
    responseTime: "< 24 Hours",
  });
  const [userRating, setUserRating] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === "users" && token) {
      fetchUsers();
    }
  }, [activeTab, token]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setToast({
        color: "red",
        icon: "error",
        message: "Failed to load users",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserMetricsForm({
      damageReports: user.metrics?.damageReports || 0,
      successfulReturns: user.metrics?.successfulReturns || 0,
      lateReturns: user.metrics?.lateReturns || 0,
      lends: user.metrics?.lends || 0,
      borrows: user.metrics?.borrows || 0,
      completionRate: user.metrics?.completionRate || 0,
      responseTime: user.metrics?.responseTime || "< 24 Hours",
    });
    setUserRating(user.rating || 0);
  };

  const handleUpdateMetrics = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users/${selectedUser.id}/metrics`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userMetricsForm),
        },
      );

      const data = await response.json();
      if (data.success) {
        setToast({
          color: "green",
          icon: "check",
          message: "User metrics updated successfully!",
        });
        fetchUsers();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating metrics:", error);
      setToast({
        color: "red",
        icon: "error",
        message: error.message || "Failed to update metrics",
      });
    }
  };

  const handleUpdateRating = async (newRating) => {
    setUserRating(newRating);
    try {
      const response = await fetch(
        `${API_URL}/users/${selectedUser.id}/rating`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: newRating }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setToast({
          color: "green",
          icon: "check",
          message: "User rating updated successfully!",
        });
        fetchUsers();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      setToast({
        color: "red",
        icon: "error",
        message: error.message || "Failed to update rating",
      });
    }
  };

  // Star Rating Component for Admin
  const StarRatingAdmin = ({ rating, onRate }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => onRate(i)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
          }}
        >
          {i <= rating ? (
            <FaStar style={{ color: "#f07c68", fontSize: "1.5rem" }} />
          ) : (
            <FaRegStar
              style={{ color: "#f07c68", fontSize: "1.5rem", opacity: 0.3 }}
            />
          )}
        </button>,
      );
    }
    return <div style={{ display: "flex", gap: "0.25rem" }}>{stars}</div>;
  };

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
      const response = await fetch(
        `${API_URL}/messages/conversation/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  const handleViewAllListing = (listing) => {
    // For pending listings, show approval modal
    if (listing.status === "pending") {
      setModal({
        type: "approval",
        data: {
          ...listing,
          submittedBy: listing.owner,
        },
      });
    } else {
      // For other listings, just view details
      setModal({
        type: "view-listing",
        data: listing,
      });
    }
  };

  const handleApprove = async () => {
    try {
      const listingId = modal.data.id;

      const response = await fetch(
        `${API_URL}/dashboard/listings/${listingId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to approve listing");
      }

      setApprovalListings((prev) =>
        prev.filter((item) => item.id !== listingId),
      );

      // Also update allListings if present
      setAllListings((prev) =>
        prev.map((item) =>
          item.id === listingId
            ? { ...item, status: "available", isApproved: true }
            : item,
        ),
      );

      setToast({
        color: "green",
        icon: "check",
        title:
          modal.data.submittedBy?.name || modal.data.owner?.name || "Listing",
        message: "approved successfully!",
      });
    } catch (err) {
      console.error("Approve error:", err);
      setToast({
        color: "red",
        title: "Error",
        message: "Failed to approve listing",
      });
    }

    handleCloseModal();
  };

  const handleReject = async () => {
    try {
      const listingId = modal.data.id;

      const response = await fetch(
        `${API_URL}/dashboard/listings/${listingId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject listing");
      }

      setApprovalListings((prev) =>
        prev.filter((item) => item.id !== listingId),
      );

      // Also update allListings if present
      setAllListings((prev) =>
        prev.map((item) =>
          item.id === listingId
            ? { ...item, status: "rejected", rejectionReason: rejectionReason }
            : item,
        ),
      );

      setToast({
        color: "red",
        icon: "trash",
        title:
          modal.data.submittedBy?.name || modal.data.owner?.name || "Listing",
        message: "was rejected!",
      });
    } catch (err) {
      console.error("Reject error:", err);
      setToast({
        color: "red",
        title: "Error",
        message: "Failed to reject listing",
      });
    }

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
    setRejectionReason("");
  };

  /*
    ! Pending Listings (for approval)
  */
  const [approvalListings, setApprovalListings] = useState([]);

  // Fetch pending listings when approvals tab is active
  useEffect(() => {
    if (activeTab === "approvals" && token) {
      fetchPendingListings();
    }
  }, [activeTab, token]);

  /*
    ! All Listings (for admin overview)
  */
  const [allListings, setAllListings] = useState([]);
  const [listingsFilter, setListingsFilter] = useState("all"); // all, pending, approved, rejected, rented

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    listing: null,
    isDeleting: false,
  });

  // Fetch all listings when all-listings tab is active
  useEffect(() => {
    if (activeTab === "all-listings" && token) {
      fetchAllListings();
    }
  }, [activeTab, token]);

  const fetchPendingListings = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/listings/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending listings");
      }

      const data = await response.json();
      if (data.success) {
        setApprovalListings(data.data.listings || []);
      }
    } catch (err) {
      console.error("Fetch pending listings error:", err);
      setToast({
        color: "red",
        title: "Error",
        message: "Failed to load pending listings",
      });
    }
  };

  const fetchAllListings = async (statusFilter = null) => {
    try {
      let url = `${API_URL}/dashboard/listings/admin/all`;
      if (statusFilter && statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      if (data.success) {
        setAllListings(data.data.listings || []);
      }
    } catch (err) {
      console.error("Fetch all listings error:", err);
      setToast({
        color: "red",
        title: "Error",
        message: "Failed to load listings",
      });
    }
  };

  // Handle delete listing
  const handleDeleteListing = async () => {
    if (!deleteConfirm.listing) return;

    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(
        `${API_URL}/dashboard/listings/${deleteConfirm.listing._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete listing");
      }

      // Remove listing from state
      setAllListings((prev) =>
        prev.filter((l) => l._id !== deleteConfirm.listing._id),
      );

      setToast({
        color: "green",
        title: "Success",
        message: `"${deleteConfirm.listing.name}" has been permanently deleted.`,
      });

      setDeleteConfirm({ isOpen: false, listing: null, isDeleting: false });
    } catch (err) {
      console.error("Delete listing error:", err);
      setToast({
        color: "red",
        title: "Error",
        message: err.message || "Failed to delete listing",
      });
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  /*
    ! Reported Users
  */
  const [reportedUsers, setReportedUsers] = useState([]);

  // Fetch reports when reports tab is active
  useEffect(() => {
    if (activeTab === "reports" && token) {
      fetchReports();
    }
  }, [activeTab, token]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      if (data.success) {
        setReportedUsers(data.data.reports || []);
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
      setToast({
        color: "red",
        title: "Error",
        message: "Failed to load reports",
      });
    }
  };

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
      section: "all-listings",
      title: "All System Listings",
      data: allListings,
      statusFn: (row) => row.status?.toLowerCase(),
      columns: [
        COLS.date("Created", "createdAt"),
        COLS.text("Owner", "owner.name"),
        COLS.text("Owner Email", "owner.email"),
        COLS.text("Game", "name"),
        COLS.platform,
        COLS.text("Console", "consoleModel"),
        COLS.text("Price", "price"),
        COLS.status,
        COLS.text("Duration (Days)", "borrowDuration"),
        COLS.date("Start Date", "startDate"),
        COLS.date("Due Date", "dueDate"),
        COLS.text("Rented By", "rentedBy.name"),
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

  const allListingReviewLayout = (listing) => [
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
        { label: "Status", value: listing.status },
        { label: "Borrow Duration", value: `${listing.borrowDuration} days` },
        { label: "Start Date", value: listing.startDate, isDate: true },
        { label: "Due Date", value: listing.dueDate, isDate: true },
        { label: "Delivery Method", value: listing.deliveryMethod },
        { label: "Expansions", value: listing.hasExpansions },
      ],
    },
    {
      title: "Owner Info",
      items: [
        { label: "Owner", value: listing.owner?.name },
        { label: "Email", value: listing.owner?.email },
        { label: "Created", value: listing.createdAt, isDate: true },
      ],
    },
    ...(listing.rentedBy
      ? [
          {
            title: "Current Rental",
            items: [
              { label: "Rented By", value: listing.rentedBy?.name },
              { label: "Renter Email", value: listing.rentedBy?.email },
            ],
          },
        ]
      : []),
    ...(listing.rejectionReason
      ? [
          {
            title: "Rejection Info",
            items: [
              { label: "Rejected At", value: listing.rejectedAt, isDate: true },
              {
                label: "Reason",
                value: listing.rejectionReason,
                isDescription: true,
              },
            ],
          },
        ]
      : []),
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
            <div
              className="title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <h2>{table.title}</h2>

              {/* Status Filter for All Listings */}
              {table.section === "all-listings" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <label style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                    Filter:
                  </label>
                  <select
                    value={listingsFilter}
                    onChange={(e) => {
                      setListingsFilter(e.target.value);
                      fetchAllListings(e.target.value);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="delivering">Delivering</option>
                    <option value="returning">Returning</option>
                    <option value="returned">Returned</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
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
                                src={
                                  row[col.key]?.startsWith("http")
                                    ? row[col.key]
                                    : `${API_URL.replace("/api", "")}${row[col.key]}`
                                }
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
                              ! All Listings Actions
                            */
                          if (table.section === "all-listings") {
                            return (
                              <span key={colIndex} className="actions">
                                <button
                                  className="icon-btn view"
                                  onClick={() => handleViewAllListing(row)}
                                >
                                  <FaEye />{" "}
                                  {row.status === "pending" ? "Review" : "View"}
                                </button>
                                <button
                                  className="icon-btn delete"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      isOpen: true,
                                      listing: row,
                                      isDeleting: false,
                                    })
                                  }
                                  title="Delete Listing"
                                >
                                  <FaTrash /> Delete
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
                  conversations.map(
                    (conv) =>
                      conv.user && (
                        <div
                          key={conv.conversationId}
                          className={`conversation-item ${
                            selectedConversation?._id === conv.user._id
                              ? "active"
                              : ""
                          } ${conv.unreadCount > 0 ? "unread" : ""}`}
                          onClick={() =>
                            fetchConversationMessages(conv.user._id)
                          }
                        >
                          <div className="conversation-info">
                            <h4>
                              {conv.user.firstName} {conv.user.lastName}
                            </h4>
                            <p className="preview">
                              {conv.lastMessage.content.substring(0, 50)}
                              {conv.lastMessage.content.length > 50
                                ? "..."
                                : ""}
                            </p>
                            <span className="timestamp">
                              {formatDate(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="unread-dot">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      ),
                  )
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
                      <p className="empty-text">
                        No messages in this conversation
                      </p>
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
                                        <span className="file-name">
                                          {att.filename}
                                        </span>
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
                              {msg.sender.firstName} •{" "}
                              {formatDate(msg.createdAt)}
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

        {/* User Management Section */}
        {activeTab === "users" && (
          <section className="dashboard-content users-section">
            <div className="title">
              <h2>User Management</h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                padding: "1.5rem",
              }}
            >
              {/* Users List */}
              <div
                style={{
                  background: "#fff8f0",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "2px solid #f07c68",
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                <h3
                  style={{
                    color: "#f07c68",
                    marginBottom: "1rem",
                    textTransform: "uppercase",
                    fontSize: "1.1rem",
                  }}
                >
                  All Users
                </h3>
                {usersLoading ? (
                  <p style={{ color: "#666" }}>Loading users...</p>
                ) : users.length === 0 ? (
                  <p style={{ color: "#666" }}>No users found</p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        style={{
                          padding: "1rem",
                          background:
                            selectedUser?.id === u.id ? "#fbead9" : "#fff",
                          border: "2px solid #f07c68",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "600",
                              color: "#2c1810",
                              fontSize: "1rem",
                            }}
                          >
                            {u.firstName} {u.lastName}
                          </span>
                          <span
                            style={{
                              padding: "0.25rem 0.5rem",
                              background:
                                u.subscriptionStatus === "active" &&
                                u.subscriptionType === "premium"
                                  ? "#e5ffe5"
                                  : "#f5f5f5",
                              color:
                                u.subscriptionStatus === "active" &&
                                u.subscriptionType === "premium"
                                  ? "#2d8a2d"
                                  : "#666",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                            }}
                          >
                            {u.subscriptionStatus === "active" &&
                            u.subscriptionType === "premium"
                              ? "Premium"
                              : "Regular"}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "#666",
                            fontSize: "0.85rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {u.email}
                        </p>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          {[1, 2, 3, 4, 5].map((star) =>
                            star <= (u.rating || 0) ? (
                              <FaStar
                                key={star}
                                style={{
                                  color: "#f07c68",
                                  fontSize: "0.875rem",
                                }}
                              />
                            ) : (
                              <FaRegStar
                                key={star}
                                style={{
                                  color: "#f07c68",
                                  fontSize: "0.875rem",
                                  opacity: 0.3,
                                }}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Edit Panel */}
              <div
                style={{
                  background: "#fff8f0",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "2px solid #f07c68",
                }}
              >
                <h3
                  style={{
                    color: "#f07c68",
                    marginBottom: "1rem",
                    textTransform: "uppercase",
                    fontSize: "1.1rem",
                  }}
                >
                  Edit User
                </h3>
                {selectedUser ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    {/* User Info */}
                    <div
                      style={{
                        padding: "1rem",
                        background: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #f07c68",
                      }}
                    >
                      <h4 style={{ color: "#2c1810", marginBottom: "0.5rem" }}>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p style={{ color: "#666", fontSize: "0.9rem" }}>
                        {selectedUser.email}
                      </p>
                    </div>

                    {/* Rating Section */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#f07c68",
                          fontSize: "0.875rem",
                          marginBottom: "0.5rem",
                          textTransform: "uppercase",
                        }}
                      >
                        User Rating
                      </label>
                      <StarRatingAdmin
                        rating={userRating}
                        onRate={handleUpdateRating}
                      />
                    </div>

                    {/* Metrics Form */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "#f07c68",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                        }}
                      >
                        User Metrics
                      </h4>

                      {[
                        { key: "damageReports", label: "Damage Reports" },
                        {
                          key: "successfulReturns",
                          label: "Successful Returns",
                        },
                        { key: "lateReturns", label: "Late Returns" },
                        { key: "lends", label: "Lends" },
                        { key: "borrows", label: "Borrows" },
                        { key: "completionRate", label: "Completion Rate (%)" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label
                            style={{
                              display: "block",
                              color: "#666",
                              fontSize: "0.8rem",
                              marginBottom: "0.25rem",
                              textTransform: "uppercase",
                            }}
                          >
                            {field.label}
                          </label>
                          <input
                            type="number"
                            value={userMetricsForm[field.key]}
                            onChange={(e) =>
                              setUserMetricsForm({
                                ...userMetricsForm,
                                [field.key]: parseInt(e.target.value) || 0,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              border: "2px solid #f07c68",
                              borderRadius: "4px",
                              background: "#fff",
                              color: "#2c1810",
                              fontFamily: "inherit",
                            }}
                          />
                        </div>
                      ))}

                      <div>
                        <label
                          style={{
                            display: "block",
                            color: "#666",
                            fontSize: "0.8rem",
                            marginBottom: "0.25rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Response Time
                        </label>
                        <input
                          type="text"
                          value={userMetricsForm.responseTime}
                          onChange={(e) =>
                            setUserMetricsForm({
                              ...userMetricsForm,
                              responseTime: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "2px solid #f07c68",
                            borderRadius: "4px",
                            background: "#fff",
                            color: "#2c1810",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleUpdateMetrics}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.75rem",
                        background: "#f07c68",
                        border: "2px solid #f07c68",
                        borderRadius: "8px",
                        color: "#fbead9",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <FaSave />
                      Save Metrics
                    </button>
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#666",
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    Select a user from the list to edit their metrics and
                    rating.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <Overlay
          isModalOpen={isAnyModalOpen || deleteConfirm.isOpen}
          onClick={() => {
            if (deleteConfirm.isOpen) {
              setDeleteConfirm({
                isOpen: false,
                listing: null,
                isDeleting: false,
              });
            } else {
              handleCloseModal();
            }
          }}
        />

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
          >
            <div style={{ margin: "1rem 0" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                Rejection Reason (Optional):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (visible to user)..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  minHeight: "80px",
                  resize: "vertical",
                }}
                maxLength={500}
              />
              <small style={{ color: "#666", fontSize: "0.75rem" }}>
                {rejectionReason.length}/500 characters
              </small>
            </div>
          </AdminReview>
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

        {modal.type === "view-listing" && (
          <AdminReview
            title="Listing Details"
            image={
              modal.data.image?.startsWith("http")
                ? modal.data.image
                : `${API_URL.replace("/api", "")}${modal.data.image}`
            }
            sections={allListingReviewLayout(modal.data)}
            onClose={handleCloseModal}
            primaryAction={{
              label: "Close",
              onClick: handleCloseModal,
              className: "confirm",
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="delete-confirm-modal">
            <div
              className="delete-modal-backdrop"
              onClick={() =>
                !deleteConfirm.isDeleting &&
                setDeleteConfirm({
                  isOpen: false,
                  listing: null,
                  isDeleting: false,
                })
              }
            />
            <div className="delete-modal-content">
              <div className="delete-modal-header">
                <div className="warning-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h2>Delete Listing</h2>
              </div>
              <div className="delete-modal-body">
                <p className="listing-name">{deleteConfirm.listing?.name}</p>
                <p className="confirm-message">
                  Are you sure you want to permanently delete this listing?
                </p>
                <div className="delete-consequences">
                  <p>This will:</p>
                  <ul>
                    <li>Remove the listing from the public catalog</li>
                    <li>Remove it from the lender&apos;s dashboard</li>
                    <li>Cancel any pending rental requests</li>
                  </ul>
                </div>
                <p className="confirm-warning">
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
              <div className="delete-modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() =>
                    setDeleteConfirm({
                      isOpen: false,
                      listing: null,
                      isDeleting: false,
                    })
                  }
                  disabled={deleteConfirm.isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete"
                  onClick={handleDeleteListing}
                  disabled={deleteConfirm.isDeleting}
                >
                  {deleteConfirm.isDeleting ? (
                    <>
                      <span className="spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
