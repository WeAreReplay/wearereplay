import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardHeader from "../layouts/DashboardHeader";
import Overlay from "../components/Overlay";
import {
  FaUser,
  FaEnvelope,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaGamepad,
  FaHandHolding,
  FaChartLine,
  FaReply,
  FaCreditCard,
  FaLock,
  FaCalendarAlt,
  FaStar,
  FaRegStar,
  FaCamera,
  FaUpload,
  FaTrash,
  FaShieldAlt,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { RiLogoutCircleLine, RiHome7Fill, RiVipCrownFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { AiFillSmile, AiOutlineCheck } from "react-icons/ai";
import { MdEmail, MdPhotoCamera } from "react-icons/md";
import "../assets/css/dashboard.css";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Profile() {
  const { user, logout, login, token } = useAuth();
  const navigate = useNavigate();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [unsubscribeSuccess, setUnsubscribeSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile picture state
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data.user);
        // Update auth context with latest user data
        login(data.data.user, token, data.data.user.role);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Profile picture upload from file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPicture(true);
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await fetch(`${API_URL}/users/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUserProfile({ ...userProfile, profilePicture: data.data.profilePicture });
        setShowProfilePictureModal(false);
        setToast({
          color: "green",
          icon: "check",
          message: "Profile picture updated successfully!",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setToast({
        color: "red",
        icon: "error",
        message: error.message || "Failed to upload profile picture",
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setToast({
        color: "red",
        icon: "error",
        message: "Could not access camera. Please check permissions.",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Take photo from camera
  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      setUploadingPicture(true);
      const formData = new FormData();
      formData.append("profilePicture", blob, "camera-photo.jpg");

      try {
        const response = await fetch(`${API_URL}/users/profile-picture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          setUserProfile({ ...userProfile, profilePicture: data.data.profilePicture });
          stopCamera();
          setShowCameraModal(false);
          setShowProfilePictureModal(false);
          setToast({
            color: "green",
            icon: "check",
            message: "Profile picture updated successfully!",
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Error uploading camera photo:", error);
        setToast({
          color: "red",
          icon: "error",
          message: error.message || "Failed to upload photo",
        });
      } finally {
        setUploadingPicture(false);
      }
    }, "image/jpeg", 0.9);
  };

  // Delete profile picture
  const deleteProfilePicture = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUserProfile({ ...userProfile, profilePicture: null });
        setShowProfilePictureModal(false);
        setToast({
          color: "green",
          icon: "check",
          message: "Profile picture deleted successfully!",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      setToast({
        color: "red",
        icon: "error",
        message: error.message || "Failed to delete profile picture",
      });
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera when camera modal opens
  useEffect(() => {
    if (showCameraModal) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showCameraModal]);

  // Toast state
  const [toast, setToast] = useState(null);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Check if user is premium
  const isPremium = userProfile?.subscriptionStatus === "active" && userProfile?.subscriptionType === "premium";

  // Get user metrics from profile
  const userMetrics = userProfile?.metrics || {};

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubscribeClick = () => {
    setShowSubscribeModal(true);
  };

  const handleProceedToPayment = () => {
    setShowSubscribeModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Call backend to activate subscription
      const response = await fetch(`${API_URL}/users/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ months: 1 }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentSuccess(true);
        // Refresh user profile
        await fetchUserProfile();

        // Close modal after showing success
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
          setCardData({ number: "", name: "", expiry: "", cvv: "" });
        }, 2000);
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/users/unsubscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUnsubscribeSuccess(true);
        // Refresh user profile
        await fetchUserProfile();

        // Close modal after showing success
        setTimeout(() => {
          setShowUnsubscribeModal(false);
          setUnsubscribeSuccess(false);
        }, 2000);
      } else {
        alert("Failed to cancel subscription. Please try again.");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Star rating component
  const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} style={{ color: "#f07c68", fontSize: "1.25rem" }} />
        ) : (
          <FaRegStar key={i} style={{ color: "#f07c68", fontSize: "1.25rem", opacity: 0.3 }} />
        )
      );
    }
    return <div style={{ display: "flex", gap: "0.25rem" }}>{stars}</div>;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const tabs = [
    {
      key: "profile",
      icon: FaUser,
      label: "My Profile",
    },
  ];

  return (
    <>
      <DashboardHeader
        userName={userProfile?.firstName || user?.firstName || "User"}
        activeTab="profile"
        setActiveTab={() => {}}
        tabs={tabs}
        onLogout={handleLogout}
      />
      <main
        className="dashboard-main"
        style={{
          backgroundColor: "#fbead9",
          backgroundImage: "url('/src/assets/images/profile-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        }}
      >
        <section className="dashboard-content">
          <div
            className="title"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: "1rem",
            }}
          >
            <h2>My Profile</h2>
          </div>

          <div
            className="profile-container"
            style={{
              padding: "1rem",
              maxWidth: "900px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div
              className="profile-card"
              style={{
                background: "#fff8f0",
                borderRadius: "20px",
                padding: "1.5rem",
                border: "2px solid #f07c68",
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.5rem",
                position: "relative",
              }}
              data-desktop-layout="false"
            >
              {/* Premium Badge */}
              {isPremium && (
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    background: "linear-gradient(135deg, #f07c68 0%, #e85d48 100%)",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  <RiVipCrownFill />
                  Premium
                </div>
              )}

              {/* User Info & Stats Container */}
              <div
                className="profile-content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Left Column - User Info (Desktop) / Top Section (Mobile) */}
                <div
                  className="profile-left-col"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "2px solid #f07c68",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: userProfile?.profilePicture
                        ? "transparent"
                        : "linear-gradient(135deg, #f07c68 0%, #e85d48 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "3rem",
                      alignSelf: "center",
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowProfilePictureModal(true)}
                  >
                  {userProfile?.profilePicture ? (
                    <img
                      src={`${API_URL.replace("/api", "")}${userProfile.profilePicture}`}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <AiFillSmile />
                  )}
                  {/* Change photo overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                      <MdPhotoCamera style={{ fontSize: "2rem", color: "#fff" }} />
                    </div>
                  </div>

                  {/* Username */}
                <div style={{ textAlign: "center" }}>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        color: "#f07c68",
                        fontWeight: "500",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {userProfile?.firstName} {userProfile?.lastName?.charAt(0)}
                    </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#f07c68",
                      opacity: 0.7,
                      fontStyle: "italic",
                    }}
                  >
                    Borrower • Lender
                  </p>
                  {/* Star Rating */}
                  <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
                    <StarRating rating={userProfile?.rating || 0} />
                  </div>
                </div>

                {/* Subscribe/Unsubscribe Button */}
                {!isPremium ? (
                  <button
                    onClick={handleSubscribeClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1.5rem",
                      background: "#fff",
                      border: "2px solid #f07c68",
                      borderRadius: "8px",
                      color: "#f07c68",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>Subscribe</span>
                    <AiOutlineCheck style={{ fontSize: "1.25rem" }} />
                  </button>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        background: "#e5ffe5",
                        border: "2px solid #2d8a2d",
                        borderRadius: "8px",
                        color: "#2d8a2d",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      <FaCheck />
                      Subscribed
                    </div>
                    {/* View Benefits Button */}
                    <button
                      onClick={() => setShowBenefitsModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        background: "#fff",
                        border: "2px solid #f07c68",
                        borderRadius: "8px",
                        color: "#f07c68",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        marginTop: "0.5rem",
                      }}
                    >
                      <RiVipCrownFill />
                      View Benefits
                    </button>
                    {/* Unsubscribe Button */}
                    <button
                      onClick={() => setShowUnsubscribeModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        background: "transparent",
                        border: "1px solid #f07c68",
                        borderRadius: "8px",
                        color: "#f07c68",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        marginTop: "0.5rem",
                      }}
                    >
                      Unsubscribe
                    </button>
                  </>
                )}

                  {/* User Contacts */}
                  <div style={{ width: "100%", maxWidth: "280px" }}>
                  <h4
                    style={{
                      color: "#f07c68",
                      fontSize: "1rem",
                      marginBottom: "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    User Contacts:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#f07c68",
                      fontSize: "0.875rem",
                    }}
                  >
                    <MdEmail size={20} />
                    <span style={{ textTransform: "uppercase" }}>Email</span>
                  </div>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {userProfile?.email || user?.email || "Not available"}
                  </p>
                </div>
              </div>

              {/* Right Column - Stats (Desktop) / Bottom Section (Mobile) */}
              <div className="profile-right-col" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* User Metrics */}
                <div>
                  <h4
                    style={{
                      color: "#f07c68",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    User Metrics:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaExclamationTriangle style={{ color: "#f07c68" }} />
                      <span style={{ color: "#f07c68", fontSize: "0.9rem" }}>
                        {String(userMetrics.damageReports || 0).padStart(2, "0")} Damage Reports
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaCheck style={{ color: "#f07c68" }} />
                      <span style={{ color: "#f07c68", fontSize: "0.9rem" }}>
                        {String(userMetrics.successfulReturns || 0).padStart(2, "0")} Successful Returns
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaClock style={{ color: "#f07c68" }} />
                      <span style={{ color: "#f07c68", fontSize: "0.9rem" }}>
                        {String(userMetrics.lateReturns || 0).padStart(2, "0")} Late Returns
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lending & Borrowing Activity */}
                <div>
                  <h4
                    style={{
                      color: "#f07c68",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Lending & Borrowing Activity:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      color: "#f07c68",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaGamepad />
                      <span>{userMetrics.lends || 0} Lends</span>
                    </div>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaHandHolding />
                      <span>{userMetrics.borrows || 0} Borrows</span>
                    </div>
                  </div>
                </div>

                {/* Response & Completion */}
                <div>
                  <h4
                    style={{
                      color: "#f07c68",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Response & Completion:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaChartLine style={{ color: "#f07c68" }} />
                      <span style={{ color: "#f07c68", fontSize: "0.9rem" }}>
                        {userMetrics.completionRate || 0}% Completion Rate
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FaReply style={{ color: "#f07c68" }} />
                      <span style={{ color: "#f07c68", fontSize: "0.9rem" }}>
                        Responds {userMetrics.responseTime || "< 24 Hours"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <Link
                    to="/"
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      background: "#fbead9",
                      color: "#f07c68",
                      border: "2px solid #f07c68",
                      borderRadius: "8px",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                    }}
                  >
                    <RiHome7Fill />
                    Home
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      background: "#f07c68",
                      color: "#fbead9",
                      border: "2px solid #f07c68",
                      borderRadius: "8px",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                    }}
                  >
                    <RiLogoutCircleLine />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </main>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <>
          <Overlay
            isModalOpen={showSubscribeModal}
            onClick={() => setShowSubscribeModal(false)}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#fff8f0",
                borderRadius: "16px",
                padding: "2rem",
                border: "3px solid #f07c68",
                maxWidth: "420px",
                width: "90%",
                pointerEvents: "auto",
                textAlign: "center",
              }}
            >
              <RiVipCrownFill
                style={{ fontSize: "3rem", color: "#f07c68", marginBottom: "1rem" }}
              />
              <h3
                style={{
                  color: "#f07c68",
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                }}
              >
                Upgrade to Premium
              </h3>
              <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                Unlock unlimited listings, priority support, and more!
              </p>
              <div
                style={{
                  background: "#fbead9",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "2rem",
                    color: "#f07c68",
                    fontWeight: "700",
                  }}
                >
                  AED 25.99
                </span>
                <span style={{ color: "#f07c68" }}>/month</span>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "transparent",
                    border: "2px solid #f07c68",
                    borderRadius: "8px",
                    color: "#f07c68",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f07c68",
                    border: "2px solid #f07c68",
                    borderRadius: "8px",
                    color: "#fbead9",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <>
          <Overlay
            isModalOpen={showUnsubscribeModal}
            onClick={() => !isProcessing && !unsubscribeSuccess && setShowUnsubscribeModal(false)}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#fff8f0",
                borderRadius: "16px",
                padding: "2rem",
                border: "3px solid #f07c68",
                maxWidth: "420px",
                width: "90%",
                pointerEvents: "auto",
              }}
            >
              {unsubscribeSuccess ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "#e5ffe5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <FaCheck style={{ fontSize: "2.5rem", color: "#2d8a2d" }} />
                  </div>
                  <h3 style={{ color: "#2d8a2d", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    Unsubscribed Successfully
                  </h3>
                  <p style={{ color: "#666" }}>Your subscription has been cancelled.</p>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#ffe5e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <FaExclamationTriangle style={{ fontSize: "1.75rem", color: "#d32f2f" }} />
                    </div>
                    <h3
                      style={{
                        color: "#f07c68",
                        fontSize: "1.25rem",
                        marginBottom: "0.5rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Cancel Subscription?
                    </h3>
                    <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                      Are you sure you want to cancel your Premium subscription?
                    </p>
                    <div
                      style={{
                        background: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        textAlign: "left",
                      }}
                    >
                      <p style={{ color: "#856404", fontSize: "0.85rem", margin: 0 }}>
                        <strong>Note:</strong> This will immediately revert your account to Regular status. 
                        You will lose access to Premium benefits including unlimited listings and priority support.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => setShowUnsubscribeModal(false)}
                      disabled={isProcessing}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "transparent",
                        border: "2px solid #f07c68",
                        borderRadius: "8px",
                        color: "#f07c68",
                        fontWeight: "600",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        textTransform: "uppercase",
                        opacity: isProcessing ? 0.5 : 1,
                      }}
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={handleUnsubscribe}
                      disabled={isProcessing}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "#d32f2f",
                        border: "2px solid #d32f2f",
                        borderRadius: "8px",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        textTransform: "uppercase",
                        opacity: isProcessing ? 0.7 : 1,
                      }}
                    >
                      {isProcessing ? "Processing..." : "Yes, Cancel"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <>
          <Overlay
            isModalOpen={showPaymentModal}
            onClick={() => !isProcessing && !paymentSuccess && setShowPaymentModal(false)}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#fff8f0",
                borderRadius: "16px",
                padding: "2rem",
                border: "3px solid #f07c68",
                maxWidth: "450px",
                width: "90%",
                pointerEvents: "auto",
              }}
            >
              {paymentSuccess ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "#e5ffe5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <FaCheck style={{ fontSize: "2.5rem", color: "#2d8a2d" }} />
                  </div>
                  <h3 style={{ color: "#2d8a2d", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    Payment Successful!
                  </h3>
                  <p style={{ color: "#666" }}>You are now a Premium member!</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <FaCreditCard style={{ fontSize: "1.5rem", color: "#f07c68" }} />
                    <h3 style={{ color: "#f07c68", fontSize: "1.25rem", textTransform: "uppercase" }}>
                      Payment Details
                    </h3>
                  </div>
                  <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                        Card Number
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({ ...cardData, number: formatCardNumber(e.target.value) })
                          }
                          maxLength={19}
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "2px solid #f07c68",
                            borderRadius: "8px",
                            background: "#fff",
                            color: "#2c1810",
                            fontSize: "1rem",
                            fontFamily: "inherit",
                          }}
                        />
                        <FaLock
                          style={{
                            position: "absolute",
                            right: "0.75rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#f07c68",
                            opacity: 0.5,
                          }}
                        />
                      </div>
                    </div>
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
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #f07c68",
                          borderRadius: "8px",
                          background: "#fff",
                          color: "#2c1810",
                          fontSize: "1rem",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            color: "#f07c68",
                            fontSize: "0.875rem",
                            marginBottom: "0.5rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            setCardData({ ...cardData, expiry: value });
                          }}
                          maxLength={5}
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "2px solid #f07c68",
                            borderRadius: "8px",
                            background: "#fff",
                            color: "#2c1810",
                            fontSize: "1rem",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            color: "#f07c68",
                            fontSize: "0.875rem",
                            marginBottom: "0.5rem",
                            textTransform: "uppercase",
                          }}
                        >
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) =>
                            setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                          }
                          maxLength={4}
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "2px solid #f07c68",
                            borderRadius: "8px",
                            background: "#fff",
                            color: "#2c1810",
                            fontSize: "1rem",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem",
                        background: "#fbead9",
                        borderRadius: "8px",
                        marginTop: "0.5rem",
                      }}
                    >
                      <FaLock style={{ color: "#f07c68", fontSize: "0.875rem" }} />
                      <span style={{ color: "#f07c68", fontSize: "0.75rem" }}>
                        This is a secure payment gateway.
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          background: "transparent",
                          border: "2px solid #f07c68",
                          borderRadius: "8px",
                          color: "#f07c68",
                          fontWeight: "600",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          textTransform: "uppercase",
                          opacity: isProcessing ? 0.5 : 1,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          background: "#f07c68",
                          border: "2px solid #f07c68",
                          borderRadius: "8px",
                          color: "#fbead9",
                          fontWeight: "600",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          textTransform: "uppercase",
                          opacity: isProcessing ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <span>Processing</span>
                            <span style={{ animation: "pulse 1s infinite" }}>...</span>
                          </>
                        ) : (
                          <>
                            <FaLock />
                            Pay AED 25.99
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && (
        <>
          <Overlay
            isModalOpen={showProfilePictureModal}
            onClick={() => !showCameraModal && setShowProfilePictureModal(false)}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#fff8f0",
                borderRadius: "16px",
                padding: "2rem",
                border: "3px solid #f07c68",
                maxWidth: "420px",
                width: "90%",
                pointerEvents: "auto",
                textAlign: "center",
              }}
            >
              <MdPhotoCamera
                style={{ fontSize: "3rem", color: "#f07c68", marginBottom: "1rem" }}
              />
              <h3
                style={{
                  color: "#f07c68",
                  fontSize: "1.25rem",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                }}
              >
                Update Profile Picture
              </h3>
              <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Choose how you want to update your profile picture
              </p>

              {/* Current Picture Preview */}
              {userProfile?.profilePicture && (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    margin: "0 auto 1.5rem",
                    overflow: "hidden",
                    border: "3px solid #f07c68",
                  }}
                >
                  <img
                    src={`${API_URL.replace("/api", "")}${userProfile.profilePicture}`}
                    alt="Current"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />

              {/* Upload Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPicture}
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
                    cursor: uploadingPicture ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    opacity: uploadingPicture ? 0.7 : 1,
                  }}
                >
                  <FaUpload />
                  Upload from Device
                </button>

                <button
                  onClick={() => setShowCameraModal(true)}
                  disabled={uploadingPicture}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    background: "#fff",
                    border: "2px solid #f07c68",
                    borderRadius: "8px",
                    color: "#f07c68",
                    fontWeight: "600",
                    cursor: uploadingPicture ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    opacity: uploadingPicture ? 0.5 : 1,
                  }}
                >
                  <FaCamera />
                  Take Photo
                </button>

                {userProfile?.profilePicture && (
                  <button
                    onClick={deleteProfilePicture}
                    disabled={uploadingPicture}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      background: "#fff",
                      border: "2px solid #d32f2f",
                      borderRadius: "8px",
                      color: "#d32f2f",
                      fontWeight: "600",
                      cursor: uploadingPicture ? "not-allowed" : "pointer",
                      textTransform: "uppercase",
                      opacity: uploadingPicture ? 0.5 : 1,
                    }}
                  >
                    <FaTrash />
                    Remove Photo
                  </button>
                )}

                <button
                  onClick={() => setShowProfilePictureModal(false)}
                  disabled={uploadingPicture}
                  style={{
                    padding: "0.75rem",
                    background: "transparent",
                    border: "2px solid #f07c68",
                    borderRadius: "8px",
                    color: "#f07c68",
                    fontWeight: "600",
                    cursor: uploadingPicture ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    opacity: uploadingPicture ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>

              {uploadingPicture && (
                <p style={{ color: "#f07c68", marginTop: "1rem", fontSize: "0.875rem" }}>
                  Uploading...
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <>
          <Overlay
            isModalOpen={showCameraModal}
            onClick={() => !uploadingPicture && setShowCameraModal(false)}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#fff8f0",
                borderRadius: "16px",
                padding: "1.5rem",
                border: "3px solid #f07c68",
                maxWidth: "500px",
                width: "90%",
                pointerEvents: "auto",
              }}
            >
              <h3
                style={{
                  color: "#f07c68",
                  fontSize: "1.25rem",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Take a Photo
              </h3>

              {/* Video Preview */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  background: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: stream ? "block" : "none",
                  }}
                />
                {!stream && (
                  <div style={{ color: "#fff", textAlign: "center" }}>
                    <FaCamera style={{ fontSize: "2rem", marginBottom: "0.5rem" }} />
                    <p>Camera loading...</p>
                  </div>
                )}
              </div>

              {/* Hidden canvas for capturing photo */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Camera Controls */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setShowCameraModal(false)}
                  disabled={uploadingPicture}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "transparent",
                    border: "2px solid #f07c68",
                    borderRadius: "8px",
                    color: "#f07c68",
                    fontWeight: "600",
                    cursor: uploadingPicture ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    opacity: uploadingPicture ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={takePhoto}
                  disabled={!stream || uploadingPicture}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f07c68",
                    border: "2px solid #f07c68",
                    borderRadius: "8px",
                    color: "#fbead9",
                    fontWeight: "600",
                    cursor: !stream || uploadingPicture ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    opacity: !stream || uploadingPicture ? 0.7 : 1,
                  }}
                >
                  {uploadingPicture ? "Uploading..." : "Take Photo"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Membership Benefits Modal */}
      {showBenefitsModal && (
        <>
          <Overlay
            isModalOpen={showBenefitsModal}
            onClick={() => setShowBenefitsModal(false)}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              pointerEvents: "none",
              padding: "1rem",
            }}
          >
            <div
              style={{
                background: "#fff8f0",
                borderRadius: "16px",
                padding: "1.5rem",
                border: "3px solid #f07c68",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                pointerEvents: "auto",
                position: "relative",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowBenefitsModal(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#f07c68",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IoClose />
              </button>

              <h2
                style={{
                  color: "#f07c68",
                  fontSize: "1.5rem",
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  textTransform: "uppercase",
                }}
              >
                Membership Benefits
              </h2>

              {/* Comparison Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                {/* Premium Column */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    border: "2px solid #f07c68",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "2px solid #f07c68",
                    }}
                  >
                    <RiVipCrownFill style={{ color: "#f07c68", fontSize: "1.5rem" }} />
                    <h3 style={{ color: "#f07c68", fontSize: "1.1rem", margin: 0 }}>
                      Premium Member
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <h4 style={{ color: "#f07c68", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaGamepad /> Listings & Visibility
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Unlimited Game Listings</li>
                        <li>Featured Listings for increased visibility</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: "#f07c68", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaHandHolding /> Borrowing Benefits
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Expanded Borrowing Capacity (up to 10 active borrows)</li>
                        <li>Reduced Protection Fees (capped at 6 AED)</li>
                        <li>Extended Return Grace Period (+1-2 days)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: "#f07c68", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaShieldAlt /> Protection & Security
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Damage Protection Coverage (50% compensation)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: "#f07c68", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaStar /> Support & Trust
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Priority Support for faster dispute resolution</li>
                        <li>Premium Badge on profile & Discord</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Regular Column */}
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    border: "2px solid #ccc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "2px solid #ccc",
                    }}
                  >
                    <AiFillSmile style={{ color: "#888", fontSize: "1.5rem" }} />
                    <h3 style={{ color: "#888", fontSize: "1.1rem", margin: 0 }}>
                      Regular User
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <h4 style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaGamepad /> Listings & Visibility
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Limited Game Listings (max 6)</li>
                        <li>Standard visibility in search results</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaHandHolding /> Borrowing Access
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Basic Borrowing Capacity (max 3)</li>
                        <li>Standard Protection Fees (6-10 AED)</li>
                        <li>Standard return deadlines</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaShieldAlt /> Protection & Security
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Security Deposit required</li>
                        <li>Basic protection policies</li>
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaRegStar /> Support & Trust
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        <li>Standard support for inquiries</li>
                        <li>Basic user profile (no badge)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowBenefitsModal(false)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "#f07c68",
                  border: "2px solid #f07c68",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background:
              toast.color === "green"
                ? "#e5ffe5"
                : toast.color === "red"
                ? "#ffe5e5"
                : "#fff3cd",
            border: `2px solid ${
              toast.color === "green" ? "#2d8a2d" : toast.color === "red" ? "#d32f2f" : "#ffc107"
            }`,
            borderRadius: "8px",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 400,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.color === "green" ? (
            <FaCheck style={{ color: "#2d8a2d", fontSize: "1.25rem" }} />
          ) : toast.color === "red" ? (
            <FaExclamationTriangle style={{ color: "#d32f2f", fontSize: "1.25rem" }} />
          ) : (
            <FaCheck style={{ color: "#ffc107", fontSize: "1.25rem" }} />
          )}
          <span
            style={{
              color:
                toast.color === "green" ? "#2d8a2d" : toast.color === "red" ? "#d32f2f" : "#856404",
              fontWeight: "500",
            }}
          >
            {toast.message}
          </span>
        </div>
      )}
    </>
  );
}
