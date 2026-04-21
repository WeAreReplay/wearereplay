import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardHeader from "../layouts/DashboardHeader";
import { FaUser, FaEnvelope, FaIdCard, FaCalendarAlt } from "react-icons/fa";
import { RiLogoutCircleLine, RiHome7Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { AiFillSmile } from "react-icons/ai";
import "../assets/css/dashboard.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/");
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
        userName={user?.firstName || "User"}
        activeTab="profile"
        setActiveTab={() => {}}
        tabs={tabs}
        onLogout={handleLogout}
      />
      <main className="dashboard-main">
        <section className="dashboard-content">
          <div className="title">
            <h2>My Profile</h2>
          </div>

          <div className="profile-container" style={{ padding: "1.5rem" }}>
            <div
              className="profile-card"
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "2rem",
                border: "2px solid #f07c68",
                maxWidth: "600px",
              }}
            >
              <div
                className="profile-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                  paddingBottom: "1.5rem",
                  borderBottom: "2px solid #f07c68",
                }}
              >
                <div
                  className="avatar"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f07c68 0%, #e85d48 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "2rem",
                    fontWeight: "600",
                  }}
                >
                  <AiFillSmile />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      color: "#2c1810",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <span
                    style={{
                      background: "#f07c68",
                      color: "#fff",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {user?.role || "Regular"}
                  </span>
                </div>
              </div>

              <div
                className="profile-details"
                style={{
                  display: "grid",
                  gap: "1.5rem",
                }}
              >
                <div
                  className="detail-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    background: "#faf7f4",
                    borderRadius: "8px",
                  }}
                >
                  <FaEnvelope style={{ color: "#f07c68", fontSize: "1.25rem" }} />
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        color: "#888",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Email
                    </label>
                    <span style={{ fontSize: "1rem", color: "#2c1810" }}>
                      {user?.email || "Not provided"}
                    </span>
                  </div>
                </div>

                <div
                  className="detail-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    background: "#faf7f4",
                    borderRadius: "8px",
                  }}
                >
                  <FaIdCard style={{ color: "#f07c68", fontSize: "1.25rem" }} />
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        color: "#888",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      User ID
                    </label>
                    <span style={{ fontSize: "1rem", color: "#2c1810" }}>
                      {user?._id || user?.id || "N/A"}
                    </span>
                  </div>
                </div>

                <div
                  className="detail-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    background: "#faf7f4",
                    borderRadius: "8px",
                  }}
                >
                  <FaCalendarAlt style={{ color: "#f07c68", fontSize: "1.25rem" }} />
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        color: "#888",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Member Since
                    </label>
                    <span style={{ fontSize: "1rem", color: "#2c1810" }}>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="profile-actions"
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <Link
                  to="/"
                  className="profile-btn"
                  style={{
                    flex: 1,
                    padding: "1rem",
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
                  }}
                >
                  <RiHome7Fill />
                  Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="profile-btn"
                  style={{
                    flex: 1,
                    padding: "1rem",
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
                  }}
                >
                  <RiLogoutCircleLine />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
